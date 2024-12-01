import sys
from bs4 import BeautifulSoup
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def modify_html_structure(html_file_path):
    try:
        with open(html_file_path, 'r', encoding='utf-8') as file:
            html_content = file.read()
        
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Find the main content block assuming it could be the body or a wrapping div
        main_content = soup.body or soup.find('div', class_='markdown-body') or soup

        # Replace generic divs with semantic tags
        for div in main_content.find_all('div'):
            if div.h2 or div.h3:
                div.name = 'section'
                div['class'] = div.get('class', []) + ['project-section']
            elif div.p or div.ul:
                div.name = 'article'
                div['class'] = div.get('class', []) + ['project-content']
        
        # Add classes directly to headers
        for header in soup.find_all(['h2', 'h3']):
            header['class'] = header.get('class', []) + [f"project-header-{header.name}"]
        
        # Wrap sections of <h3> in a div
        for h3 in main_content.find_all('h3'):
            wrapper = soup.new_tag('div', **{'class': 'h3-section'})
            current_element = h3
            # Append the <h3> itself
            wrapper.append(current_element.extract())
            sibling = current_element.find_next_sibling()
            while sibling and sibling.name != 'h3':
                next_sibling = sibling.find_next_sibling()  # Save reference to the next sibling
                wrapper.append(sibling.extract())  # Move sibling to the wrapper
                sibling = next_sibling
            if current_element.previous_element:
                current_element.previous_element.insert_after(wrapper)
            else:
                main_content.insert(0, wrapper)
        
        # Handle media paths
        media_block = soup.find('ul', string=lambda text: text and ('Image Path' in text or 'Video Path' in text))
        if media_block:
            media_block.name = 'aside'
            media_block['class'] = ['project-media']
        
        # Handle links
        link_sections = soup.find_all('ul', string=lambda text: text and ('GitHub Repository' in text or 'Additional Resources' in text))
        for link_section in link_sections:
            link_section.name = 'nav'
            link_section['class'] = ['project-links']
        
        # Ensure proper wrapping for the whole content
        main_tag = soup.new_tag('main', **{'class': 'project-page'})
        main_tag.append(main_content)
        soup.body.clear()
        soup.body.append(main_tag)
        
        # Write the modified HTML to the same file
        with open(html_file_path, 'w', encoding='utf-8') as file:
            file.write(str(soup))
            
        logging.info(f"Successfully modified HTML structure of {html_file_path}")
    
    except FileNotFoundError:
        logging.error(f"The file {html_file_path} was not found.")
    except Exception as e:
        logging.error(f"An error occurred while modifying the file: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        logging.error("Usage: python modify_html_structure.py <html_file_path>")
        sys.exit(1)
    
    modify_html_structure(sys.argv[1])
