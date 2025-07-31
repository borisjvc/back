# Usar imagen oficial de Node.js
FROM node:18-alpine

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el código fuente
COPY . .

# Exponer el puerto
EXPOSE 3001

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3001

# Comando para ejecutar la aplicación
CMD ["npm", "start"]