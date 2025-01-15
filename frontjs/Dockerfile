FROM node:18

# Define o diretório de trabalho no container
WORKDIR /app

# Copia os arquivos do projeto
COPY . .

# Instala as dependências
RUN npm install

# Expõe a porta
EXPOSE 8001

# Comando para iniciar o servidor
CMD ["npm", "start"]
