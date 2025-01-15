FROM node:18

# Define o diretório de trabalho no container
WORKDIR /usr/src/app

# Copia os arquivos necessários para o container
COPY package*.json ./
COPY . .

# Instala as dependências
RUN npm install

# Expõe a porta para o servidor
EXPOSE 3000

# Comando para rodar o servidor
CMD ["npm", "start"]
