
"""
KNOWLEDGE ENGINE: Documentation Ingestor
Ingests REAPER ReaScript help and Manual into DuckDB/LanceDB.
"""
import os
import duckdb
import lancedb
from bs4 import BeautifulSoup
from sentence_transformers import SentenceTransformer

# 1. Load documentation
def ingest_reaper_docs(html_path):
    print(f"Reading documentation from {html_path}...")
    with open(html_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
    
    # Extract API functions (REAPER reascripthelp.html structure)
    functions = []
    for code_tag in soup.find_all('code'):
        func_name = code_tag.text.strip()
        # Find description (usually following text or siblings)
        description = code_tag.find_next_sibling(text=True)
        if description:
            functions.append({
                "name": func_name,
                "description": description.strip(),
                "category": "API"
            })
    return functions

# 2. Vectorize and store
def setup_vector_store(docs):
    model = SentenceTransformer('all-MiniLM-L6-v2')
    db = lancedb.connect("./ril_memory")
    
    # Process data for storage
    data = []
    for doc in docs:
        embedding = model.encode(f"{doc['name']}: {doc['description']}")
        data.append({
            "vector": embedding,
            "text": doc['description'],
            "name": doc['name'],
            "category": doc['category']
        })
    
    table = db.create_table("reaper_api", data=data, mode="overwrite")
    print(f"Successfully indexed {len(docs)} API functions.")

if __name__ == "__main__":
    # Example usage
    # docs = ingest_reaper_docs("path/to/reascripthelp.html")
    # setup_vector_store(docs)
    pass
