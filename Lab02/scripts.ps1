docker build -t wrc-news-guilherme-app:latest .

docker run -d -p 80:80 --name wrc-news-guilherme-app wrc-news-guilherme-app:latest

az login

# Create resouce group
az group create --name containerapplab003 --location westus

# Create Container Registry
az acr create --resource-group containerapplab003 --name wrcnewsregistry --sku Basic

# login to ACR
az acr login --name wrcnewsregistry

# Tag the image
docker tag wrc-news-guilherme-app:latest wrcnewsregistry.azurecr.io/wrc-news-guilherme-app:latest

# Push the image to ACR
docker push wrcnewsregistry.azurecr.io/wrc-news-guilherme-app:latest

# containerID=$containerID
# user=$username
# password=$password

# Create environment container app
az containerapp env create --name wrc-news-guilherme-env --resource-group containerapplab003 --location westus

# Create container app
az containerapp create --name wrc-news-guilherme-app --resource-group containerapplab003 --environment wrc-news-guilherme-env --image wrcnewsregistry.azurecr.io/wrc-news-guilherme-app:latest --ingress 'external' --target-port 80 --registry-server wrcnewsregistry.azurecr.io --registry-username $username --registry-password $password