# CodeQuote

A developer inspiration and motivational quote website, built to demonstrate a complete DevOps workflow:

**Git → GitHub → Tests → Docker → Docker Hub → Jenkins → Kubernetes**

## Features

- Featured quote with copy, save and share buttons
- Quote of the Day
- 26 quotes with category filters and live search
- Favourites saved in the browser
- Responsive Tropical Neon theme (cyan, pink, black)

## Built With

HTML5, CSS3, JavaScript, Bash, Git, GitHub Codespaces, Docker, Nginx, Jenkins, Kubernetes


## Run Locally

```bash
python3 -m http.server 8000 --directory app
```

Then open port 8000 from the **Ports** tab in Codespaces.

## Run Tests

```bash
./tests/check.sh
```

Prints `[PASS]` or `[FAIL]` for each check. Exit code `0` means all passed, `1` means something failed.

## Run with Docker

```bash
docker build -t codequote .
docker run -d --name codequote-test -p 8080:80 codequote
```

Then open `http://localhost:8080`.

## CI/CD Pipeline (Jenkins)

The `Jenkinsfile` runs these stages. If any stage fails, the pipeline stops.

1. Checkout
2. Test
3. Build Docker Image
4. Container Smoke Test
5. Push Image to Docker Hub
6. Deploy to Kubernetes
7. Verify Deployment

Docker Hub login uses Jenkins credentials. No passwords or tokens are stored in this repository.

## Kubernetes

The app runs as 2 replicas with rolling updates and health checks on `/health.html`.

```bash
kubectl apply -f k8s/
kubectl get deployments
kubectl get pods
kubectl get services
```

Scale and roll back:

```bash
kubectl scale deployment/codequote --replicas=3
kubectl rollout status deployment/codequote
kubectl rollout undo deployment/codequote
```

## Team

Bhavitha Sri 
P.Shripriya
Ch.Akanksha
Sadiyah Begum
-B.Tech CSE, ACE Engineering College.
