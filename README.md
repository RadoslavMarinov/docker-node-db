## Build and run the app
- Rebuld nodejs app
  
  ```sh
  docker-compose up [-d] --build app
  ```

- start node standalone
  `dotenv -e .env.local npx ts-node main.ts`