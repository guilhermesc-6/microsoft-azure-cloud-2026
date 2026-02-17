import streamlit as st
from azure.storage.blob import BlobServiceClient
import os
import pymssql
import uuid
import json
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

blobConnectionString = os.getenv("BLOB_CONNECTION_STRING")
blobContainerName = os.getenv("BLOB_CONTAINER_NAME")
blobAccountName = os.getenv("BLOB_ACCOUNT_NAME")

SQL_SERVER = os.getenv("SQL_SERVER")
SQL_DATABASE = os.getenv("SQL_DATABASE")
SQL_USER = os.getenv("SQL_USER")
SQL_PASSWORD = os.getenv("SQL_PASSWORD")

st.title('Cadastro de Produtos')

# form cadastro de produtos
prodct_name = st.text_input('Nome do Produto')
prodct_description = st.text_area('Descrição do Produto')
prodct_price = st.number_input('Preço do Produto', min_value=0.0, step=0.01, format="%.2f")
product_category = st.text_input('Categoria do Produto')
product_stock = st.number_input('Quantidade em Estoque', min_value=0, step=1)
product_image = st.file_uploader('Imagem do Produto', type=['jpg', 'jpeg', 'png'])

#Save image on blob storage and save product data on SQL database
def upload_blob(file):
    blob_service_client = BlobServiceClient.from_connection_string(blobConnectionString)
    container_client = blob_service_client.get_container_client(blobContainerName)
    blob_name = str(uuid.uuid4()) + "_" + product_image.name
    blob_client = container_client.get_blob_client(blob_name)
    blob_client.upload_blob(file.read(), overwrite=True)
    image_url = f"https://{blobAccountName}.blob.core.windows.net/{blobContainerName}/{blob_name}"
    return image_url

def insert_product(name, description, price, product_image):
    try:
        image_url = upload_blob(product_image)
        connection = pymssql.connect(server=SQL_SERVER, user=SQL_USER, password=SQL_PASSWORD, database=SQL_DATABASE)
        cursor = connection.cursor()
        insert_query = "INSERT INTO Produtos (nome, descricao, preco, categoria, estoque, image_url) VALUES (%s, %s, %s, %s, %s, %s)"
        cursor.execute(insert_query, (name, description, price, product_category, product_stock, image_url))
        connection.commit()
        connection.close()
        return True
    except Exception as e:
        st.error(f'Erro ao cadastrar produto: {e}')
        return False
    
def list_products():
    try:
        connection = pymssql.connect(server=SQL_SERVER, user=SQL_USER, password=SQL_PASSWORD, database=SQL_DATABASE)
        cursor = connection.cursor()
        select_query = "SELECT nome, descricao, preco, image_url, categoria, created_at, estoque FROM Produtos"
        cursor.execute(select_query)
        products = cursor.fetchall()
        connection.close()
        return products
    except Exception as e:
        st.error(f'Erro ao listar produtos: {e}')
        return []
    
def list_products_screen():
    products = list_products()
    if products:
        cards_by_line = 3
        cols = st.columns(cards_by_line)
        for index, product in enumerate(products):
            col = cols[index % cards_by_line]
            with col:
                st.markdown(f"### {product[0]}")
                st.write(f"**Descrição:** {product[1]}")
                st.write(f"**Preço:** R${float(product[2]):.2f}")
                st.write(f"**Categoria:** {product[4]}")
                formatted_date = product[5].strftime("%d/%m/%Y %H:%M:%S")
                st.write(f"**Adicionado em:** {formatted_date}")
                st.write(f"**Estoque:** {product[6]}")
                if product[3]:
                    html_img = f'<img src="{product[3]}" alt="{product[0]}" width="200" height="200" style="width:100%; height:auto;">'
                    st.markdown(html_img, unsafe_allow_html=True)
                st.markdown("---")
            if(index + 1) % cards_by_line == 0 and (index + 1) != len(products):
                cols = st.columns(cards_by_line)
    else:
        st.info('Nenhum produto cadastrado.')

if st.button('Cadastrar Produto'):
    if prodct_name and prodct_description and prodct_price and product_image:
        if insert_product(prodct_name, prodct_description, prodct_price, product_image):
            st.success('Produto cadastrado com sucesso!')
            list_products_screen()
    else:
        st.error('Por favor, preencha todos os campos e selecione uma imagem.')
    

st.header("Produtos Cadastrados")

if st.button("Listar Produtos"):
    list_products_screen()