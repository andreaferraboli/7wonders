---
description: come avviare l'intero progetto 7 Wonders in sviluppo
---

## Avvio rapido (raccomandato)

Dalla cartella root del progetto, esegui lo script PowerShell:

```powershell
.\start.ps1
```

Lo script:
1. Installa tutte le dipendenze con `pnpm install`
2. Compila il pacchetto `shared`
3. Avvia **server** e **client** in due finestre PowerShell separate

- **Server** → http://localhost:2567
- **Client** → http://localhost:5173

---

## Avvio manuale (alternativa)

### 1. Installa dipendenze
```powershell
npx pnpm install
```

### 2. Compila il pacchetto shared
```powershell
cd packages/shared
npx pnpm run build
cd ../..
```

### 3. Avvia server e client in parallelo
```powershell
# Terminale 1 - Server
cd apps/server
npx pnpm run dev

# Terminale 2 - Client
cd apps/client
npx pnpm run dev
```

### Oppure tutto insieme dalla root
```powershell
npx pnpm run dev
```

---

## Note
- Il server usa `tsx watch` per hot-reload automatico
- Il client usa Vite con HMR
- Se `pnpm` non è installato globalmente, lo script usa `npx pnpm` automaticamente
