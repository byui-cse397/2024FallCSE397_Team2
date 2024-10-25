import sys
from bs4 import BeautifulSoup
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def wrap_in_divs(html_file_path):
    try:
        with open(html_file_path, 'r', encoding='utf-8') as file:
            html_content = file.read()
        
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Example: Wrapping headers and paragraphs in divs
        elements_to_wrap = soup.find_all(['h1', 'h2', 'h3', 'p', 'ul', 'ol', 'table'])
        
        for element in elements_to_wrap:
            # Skip if the element is already inside a div we want to keep
            if element.parent.name == 'div' and 'class' in element.parent.attrs and 'content-block' in element.parent['class']:
                continue
            
            # Create a new div for each element
            div_class = f"content-block-{element.name}" if element.name in ['h1', 'h2', 'h3'] else "content-block"
            new_div = soup.new_tag("div", **{'class': div_class})
            
            # Wrap the current element
            element.wrap(new_div)
            
            # Move following siblings that should be included in this block
            while element.next_sibling and not isinstance(element.next_sibling, type(element)):
                next_sibling = element.next_sibling
                next_sibling.extract()
                new_div.append(next_sibling)
        
        with open(html_file_path, 'w', encoding='utf-8') as file:
            file.write(str(soup))
            
        logging.info(f"Successfully processed {html_file_path}")
    
    except FileNotFoundError:
        logging.error(f"The file {html_file_path} was not found.")
    except Exception as e:
        logging.error(f"An error occurred while processing the file: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        logging.error("Usage: python wrap_in_divs.py <html_file_path>")
        sys.exit(1)
    
    wrap_in_divs(sys.argv[1])
