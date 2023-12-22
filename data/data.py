import pandas as pd
import requests
from bs4 import BeautifulSoup

# URL of the Wikipedia page
url = "https://fr.wikipedia.org/wiki/M%C3%A9tro_de_Paris"

# Send a GET request to fetch the webpage content
response = requests.get(url)

# Parse the HTML content using BeautifulSoup
soup = BeautifulSoup(response.text, 'html.parser')

# Find the first table on the page (assumed to be the table for all Paris Métro stations)
table = soup.find('table', {'class': 'wikitable'})

# Read the HTML table into a pandas DataFrame
df = pd.read_html(str(table))[0]

# Save the DataFrame as a CSV file
df.to_csv('paris_metro_stations.csv', index=False)

# url = "https://parispass.com/en-us/paris-transport/metro-map"

# # Send a GET request to fetch the webpage content
# response = requests.get(url)

# # Parse the HTML content using BeautifulSoup
# soup = BeautifulSoup(response.text, 'html.parser')

# # Find the first table on the page (assumed to be the table for all Paris Métro stations)
# table = soup.find('table', {'class': 'wikitable'})

# # Read the HTML table into a pandas DataFrame
# df = pd.read_html(str(table))[0]

# # Save the DataFrame as a CSV file
# df.to_csv('paris_metro.csv', index=False)