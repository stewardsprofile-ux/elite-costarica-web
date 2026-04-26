import pandas as pd
import requests
import os
import re

# --- CONFIGURACIÓN DE RUTAS ---
ARCHIVO_EXCEL = r'C:\Users\stewa\OneDrive\Escritorio\Catalogo\vyvstorecr.xlsx'
CARPETA_DESTINO = r'C:\Users\stewa\OneDrive\Escritorio\Catalogo\Imagenes_Descargadas'

# Crear la carpeta donde caerán las fotos si no existe
if not os.path.exists(CARPETA_DESTINO):
    os.makedirs(CARPETA_DESTINO)

def limpiar_nombre(nombre):
    # Quita caracteres que Windows no permite en nombres de archivos
    nombre = re.sub(r'[\\/*?:"<>|]', '', str(nombre))
    # Quita puntos iniciales y espacios
    return nombre.strip().lstrip('.')

def ejecutar_descarga():
    try:
        # 1. Leer el archivo Excel
        print(f"📖 Leyendo archivo: {ARCHIVO_EXCEL}")
        df = pd.read_excel(ARCHIVO_EXCEL)
        
        # 2. Verificar que las columnas existen (basado en tu captura de Instant Data Scraper)
        col_url = 'img-fluid src'
        col_nombre = 'product-detail'

        if col_url not in df.columns or col_nombre not in df.columns:
            print(f"❌ Error: No encontré las columnas '{col_url}' o '{col_nombre}'")
            return

        print(f"🚀 Iniciando descarga de {len(df)} imágenes...")

        for index, fila in df.iterrows():
            url_foto = fila[col_url]
            nombre_perfume = fila[col_nombre]

            if pd.isna(url_foto) or pd.isna(nombre_perfume):
                continue

            # Limpiar el nombre para que sea un archivo válido
            nombre_archivo = limpiar_nombre(nombre_perfume)
            
            # Definir la ruta final (usamos .webp porque es lo que detectó el scraper)
            ruta_final = os.path.join(CARPETA_DESTINO, f"{nombre_archivo}.webp")

            # Si hay nombres duplicados, le agrega un número para no borrar el anterior
            contador = 1
            while os.path.exists(ruta_final):
                ruta_final = os.path.join(CARPETA_DESTINO, f"{nombre_archivo}_{contador}.webp")
                contador += 1

            try:
                # Descargar la imagen
                headers = {'User-Agent': 'Mozilla/5.0'}
                respuesta = requests.get(url_foto, headers=headers, timeout=15)
                
                if respuesta.status_code == 200:
                    with open(ruta_final, 'wb') as f:
                        f.write(respuesta.content)
                    print(f"✅ Guardado: {nombre_archivo}")
                else:
                    print(f"❌ Falló descarga ({respuesta.status_code}): {nombre_archivo}")
            
            except Exception as e:
                print(f"⚠️ Error con {nombre_archivo}: {e}")

        print(f"\n✨ ¡PROCESO COMPLETADO! Tus imágenes están en: {CARPETA_DESTINO}")

    except Exception as e:
        print(f"🔴 Error general: {e}")

if __name__ == "__main__":
    ejecutar_descarga()