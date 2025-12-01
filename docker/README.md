# Web Admin App – Source Image

This directory contains the Docker setup for building the **source image** of the Web (Admin) service.

The image is a production build of the **Vue 3 + Vite** frontend,
served via **Nginx**.  
It is designed for deployment inside Kubernetes (Minikube environment).

---

## Build

```bash
  cd ./../
  docker build -t alslob/msa-sandbox:web-latest -f docker/Dockerfile --target nginx --build-arg MODE=minikube .
```

## Push to Docker Hub

```bash
  docker push alslob/msa-sandbox:web-latest
```

## Notes

 - The image is multi-stage: build (Node) → runtime (Nginx).
 - Environment variables like AUTH_URL and CRM_URL should point to Minikube ingress domains:
    ```
    AUTH_URL=https://auth.local
    CRM_URL=https://crm.local
    ```
 - Nginx config supports Vue Router history mode.
 - The image contains only built static files — no dev dependencies.
