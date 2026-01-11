"""
Wikipedia scraper using BeautifulSoup
No API calls - just good old HTML parsing
"""
import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
import re
import logging

logger = logging.getLogger(__name__)


class WikipediaScraper:
    """Handles scraping Wikipedia articles"""
    
    def __init__(self, timeout: int = 10):
        self.timeout = timeout
        # Pretend to be a browser so Wikipedia doesn't block us
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def scrape(self, url: str) -> Dict:
        """
        Scrape a Wikipedia article and pull out the good stuff.
        
        Returns a dict with:
        - title: Article title
        - summary: First few paragraphs
        - sections: All the section headings
        - full_content: Complete article text
        - raw_html: Original HTML (just in case we need it later)
        
        Raises:
            ValueError: If URL is invalid
            requests.exceptions.Timeout: If request times out
            requests.exceptions.ConnectionError: If connection fails
            requests.exceptions.RequestException: For other network errors
            Exception: For parsing errors
        """
        # Make sure it's actually a Wikipedia URL
        if not url or not url.strip():
            raise ValueError("URL cannot be empty")
            
        if not self._is_valid_wikipedia_url(url):
            raise ValueError("Invalid Wikipedia URL. Must be a Wikipedia article URL (e.g., https://en.wikipedia.org/wiki/Article_Name)")
        
        try:
            # Grab the page
            logger.info(f"Fetching Wikipedia page: {url}")
            response = requests.get(url, headers=self.headers, timeout=self.timeout)
            response.raise_for_status()
            
        except requests.exceptions.Timeout:
            logger.error(f"Timeout fetching {url}")
            raise
        except requests.exceptions.ConnectionError:
            logger.error(f"Connection error fetching {url}")
            raise
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                raise ValueError(f"Wikipedia article not found: {url}")
            elif e.response.status_code == 403:
                raise ValueError("Access to Wikipedia was denied. Please try again later.")
            else:
                logger.error(f"HTTP error {e.response.status_code} fetching {url}")
                raise
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error fetching {url}: {e}")
            raise
        
        try:
            # Parse it
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract all the parts we need
            title = self._extract_title(soup)
            if not title or title == "Unknown Title":
                raise ValueError("Could not extract article title. The page might not be a valid Wikipedia article.")
            
            summary = self._extract_summary(soup)
            if not summary:
                logger.warning(f"No summary found for {url}")
            
            sections = self._extract_sections(soup)
            full_content = self._extract_full_content(soup)
            
            if not full_content:
                raise ValueError("Could not extract article content. The page might be empty or malformed.")
            
            logger.info(f"Successfully scraped: {title}")
            return {
                "title": title,
                "summary": summary,
                "sections": sections,
                "full_content": full_content,
                "raw_html": response.text
            }
            
        except Exception as e:
            logger.error(f"Error parsing Wikipedia page {url}: {e}")
            raise ValueError(f"Failed to parse Wikipedia article: {str(e)}")
    
    def _is_valid_wikipedia_url(self, url: str) -> bool:
        """Quick check to make sure it's a Wikipedia article"""
        pattern = r'^https?://(en\.)?wikipedia\.org/wiki/[^:]+$'
        return bool(re.match(pattern, url))
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Get the article title"""
        title_tag = soup.find('h1', id='firstHeading')
        if not title_tag:
            title_tag = soup.find('h1', class_='firstHeading')
        if not title_tag:
            title_tag = soup.find('h1')
        
        if title_tag:
            return title_tag.get_text().strip()
        return "Unknown Title"

    def _get_content_wrapper(self, soup: BeautifulSoup) -> Optional[BeautifulSoup]:
        """
        Find the main content wrapper.
        Usually it's the div with class 'mw-parser-output' that contains the most paragraphs.
        """
        candidates = soup.find_all('div', class_='mw-parser-output')
        if not candidates:
            # Fallback to mw-content-text which is the outer container
            return soup.find('div', id='mw-content-text')
        
        # Pick the one with the most paragraphs - this avoids small meta boxes
        return max(candidates, key=lambda d: len(d.find_all('p')))
    
    def _extract_summary(self, soup: BeautifulSoup) -> str:
        """
        Grab the intro paragraphs before the table of contents.
        This is usually the best summary of what the article is about.
        """
        paragraphs = []
        
        # Find the main content area
        content = self._get_content_wrapper(soup)
        if not content:
            return ""
        
        # Get paragraphs until we hit a heading or TOC
        for element in content.children:
            if element.name == 'p':
                text = element.get_text().strip()
                # Skip empty ones and coordinate stuff
                if text and not text.startswith('Coordinates:'):
                    paragraphs.append(text)
                    # Usually 3-5 paragraphs is enough for a good summary
                    if len(paragraphs) >= 5:
                        break
            elif element.name in ['h2', 'div'] and (element.get('id') == 'toc' or 'toc' in (element.get('class') or [])):
                # Stop when we hit the first section or TOC
                break
        
        return ' '.join(paragraphs)
    
    def _extract_sections(self, soup: BeautifulSoup) -> List[str]:
        """Pull out all the section headings from the main content"""
        sections = []
        content = self._get_content_wrapper(soup)
        if not content:
            return []
            
        # Look for h2 tags - those are the main sections
        for heading in content.find_all('h2'):
            span = heading.find('span', class_='mw-headline')
            if span:
                section_text = span.get_text().strip()
            else:
                section_text = heading.get_text().strip()
                
            # Skip the boring meta sections
            if section_text and section_text not in ['Contents', 'References', 'External links', 
                                                   'Notes', 'See also', 'Further reading']:
                sections.append(section_text)
        
        return sections
    
    def _extract_full_content(self, soup: BeautifulSoup) -> str:
        """
        Get all the text from the article.
        We clean out references, tables, and navigation stuff.
        """
        content = self._get_content_wrapper(soup)
        if not content:
            return ""
        
        # Remove stuff we don't want
        for unwanted in content.find_all(['sup', 'table', 'div'], class_=['reference', 'reflist', 'navbox', 'infobox']):
            unwanted.decompose()
        
        # Get all the paragraph text
        paragraphs = []
        for p in content.find_all('p'):
            text = p.get_text().strip()
            if text:
                paragraphs.append(text)
        
        return ' '.join(paragraphs)


def scrape_wikipedia(url: str) -> Dict:
    """
    Quick helper function to scrape a Wikipedia article.
    Just creates a scraper and runs it.
    """
    scraper = WikipediaScraper()
    return scraper.scrape(url)
