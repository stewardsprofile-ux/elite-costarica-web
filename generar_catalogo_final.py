import os
import pandas as pd
import re

# 1. LISTA DE MARCAS LIMPIA Y COMPLETA
MARCAS_VALIDAS = [
    "ABERCROMBIE", "ADIDAS", "AFNAN", "ALHAMBRA", "AMARAN", "ANIMALE", "ARABIAN", 
    "ARAMIS", "ARDEN", "ARMAF", "ARMANI", "ARMY", "ASDAAF", "ASDAF", "AVENUE", 
    "AZZARO", "BANDERAS", "BENETON", "BENETTON", "BENTLEY", "BENZ", "BHARARA", 
    "BLANC", "BLOSSOM", "BOSS", "BOUCHERON", "BURBERRY", "BVLGARI", "CARPENTER", 
    "CARTIER", "CHAMEAU", "CHANEL", "CHLOE", "CHOO", "CLINIQUE", "COACH", "COLE", 
    "CREED", "DAVIDOFF", "DIESEL", "DIOR", "DKNY", "DUMONT", "DUNHILL", "EILISH", 
    "ELLIS", "EMPER", "EROS", "ESCADA", "ESCAPE", "FACONNABLE", "FALCONE", 
    "FERRAGAMO", "FITCH", "FORD", "GABBANA", "GAULTIER", "GIORGIO", "GISADA", 
    "GIVENCHY", "GRANDE", "GRANDEUR", "GUCCI", "GUERLAIN", "GUESS", "HAMBRA", 
    "HARAMAIN", "HAWAS", "HERMES", "HERRERA", "HILFIGER", "HILTON", "HOLLISTER", 
    "HUMMER", "JACOBS", "JOOP", "KARAN", "KENZO", "KHADLAJ", "KLEIN", "KORBAJ", 
    "LABO", "LACOSTE", "LANCOME", "LAROCHE", "LATTAFA", "LAUDER", "LAUREN", 
    "LAURENT", "LEMPICKA", "LOEWE", "MAISON", "MALUL", "MANCERA", "MARLY", "MARTIN", 
    "MESSI", "MILANO", "MIYAKE", "MONTALE", "MONTBLANC", "MOSCHINO", "MUGLER", 
    "NARCISO", "NUSUK", "ORIENTICA", "PARIS", "PERRY", "POZO", "PRADA", "PUIG", 
    "RABANNE", "RASASI", "RAVE", "RAYHAAN", "RICCI", "RIHANNA", "ROCHAS", 
    "RODRIGUEZ", "ROLF", "RONALDO", "SABATINI", "SEBASTIAN", "SHAKIRA", "SIMPSON", 
    "SPEARS", "TAYLOR", "TOUS", "VALENTINO", "VERSACE", "VORV", "WIRTZ", "WORLD", 
    "XERJOFF", "ZAKAT", "ZANZIBAR"
]

MARCAS_ARABES = ["LATTAFA", "ALHAMBRA", "ASDAAF", "AFNAN", "ARMAF", "AJMAL", "HARAMAIN", "ORIENTICA", "RASASI", "RAVE", "MAISON"]

CARPETA_IMAGENES = 'images'
NOMBRE_EXCEL = 'Catalogo_Elite_Final.xlsx'

def evaluar_calidad(nombre_archivo):
    """Prioriza archivos sin dimensiones en el nombre (Originales HD)"""
    tiene_resolucion = re.search(r'\d+[X|x]\d+', nombre_archivo)
    if not tiene_resolucion:
        return 3
    
    resolucion = tiene_resolucion.group(0).upper()
    try:
        ancho = int(resolucion.split('X')[0])
        return 2 if ancho >= 600 else 1
    except:
        return 1

def generar():
    if not os.path.exists(CARPETA_IMAGENES):
        print(f"❌ Carpeta '{CARPETA_IMAGENES}' no encontrada.")
        return

    archivos = [f for f in os.listdir(CARPETA_IMAGENES) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
    mejores_versiones = {}

    print(f"🚀 Procesando {len(archivos)} imágenes...")

    for foto in archivos:
        nombre_base = os.path.splitext(foto)[0].upper()
        
        solo_letras = re.sub(r'[^A-Z]', '', nombre_base)
        if len(solo_letras) < 3 or any(bad in nombre_base for bad in ["WHATSAPP", "SCREENSHOT"]):
            continue
            
        nombre_identidad = re.sub(r'\d+[X|x]\d+', '', nombre_base).replace('-', ' ').strip()
        puntos_calidad = evaluar_calidad(nombre_base)

        if nombre_identidad not in mejores_versiones or puntos_calidad > mejores_versiones[nombre_identidad]['puntos']:
            
            tipo = "Hombre"
            if "UNISEX" in nombre_base: tipo = "Unisex"
            elif any(p in nombre_base for p in ["MUJER", "WOMAN", "LADY", "FEMME", "GIRL"]): tipo = "Mujer"
            
            marca_detectada = "Otros"
            for m in sorted(MARCAS_VALIDAS, key=len, reverse=True):
                if m in nombre_base:
                    marca_detectada = m
                    break
            
            if any(ma in nombre_base for ma in MARCAS_ARABES):
                categoria = "Arabes"
            elif any(est in nombre_base for est in ["SET", "ESTUCHE", "KIT", "GIFT"]):
                categoria = "Estuches"
            else:
                categoria = tipo

            mejores_versiones[nombre_identidad] = {
                'Title': nombre_identidad.title(),
                'Image': f"images/{foto}",
                'categoria': categoria,
                'tipo': tipo,
                'marca': marca_detectada,
                'puntos': puntos_calidad
            }

    resultado = list(mejores_versiones.values())
    for r in resultado: r.pop('puntos')

    df = pd.DataFrame(resultado)
    df.to_excel(NOMBRE_EXCEL, index=False)
    
    print(f"✅ ¡TERMINADO! Se generó '{NOMBRE_EXCEL}' con {len(resultado)} perfumes únicos.")

if __name__ == "__main__":
    generar()