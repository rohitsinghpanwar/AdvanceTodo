import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
//export default defineConfig({
  //plugins: [react()],
//})



export default {
  server: {
    host: '0.0.0.0',  // Allows access from outside localhost
    port: 5173,       // Ensure this port is open in your EC2 security group
  }
}
