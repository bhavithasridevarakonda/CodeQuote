# 🚀 CodeQuote — Developer Inspiration & Complete DevOps CI/CD Workflow

> **A College DevOps Capstone Project**  
> Demonstrating an industrial end-to-end pipeline:  
> **Git ➔ GitHub ➔ Automated Tests ➔ Docker ➔ Docker Hub ➔ Jenkins ➔ Kubernetes**  
> Built strictly in GitHub Codespaces using pure HTML5, CSS3, and Vanilla JavaScript.

---

## 📋 Table of Contents
1. [Project Overview & Viva Executive Summary](#1-project-overview--viva-executive-summary)
2. [Project File Structure](#2-project-file-structure)
3. [Phase 1: Git & GitHub Version Control](#phase-1-git--github-version-control)
4. [Phase 2: Automated Quality Testing (Bash Test Suite)](#phase-2-automated-quality-testing-bash-test-suite)
5. [Phase 3: Containerization with Docker & Nginx](#phase-3-containerization-with-docker--nginx)
6. [Phase 4: Docker Hub Registry Publishing](#phase-4-docker-hub-registry-publishing)
7. [Phase 5: Jenkins Declarative CI/CD Pipeline](#phase-5-jenkins-declarative-cicd-pipeline)
8. [Phase 6: Kubernetes Cluster Orchestration & Self-Healing](#phase-6-kubernetes-cluster-orchestration--self-healing)
9. [Comprehensive College Viva Voce Master Cheat Sheet](#9-comprehensive-college-viva-voce-master-cheat-sheet)

---

## 1. Project Overview & Viva Executive Summary

**What is CodeQuote?**  
CodeQuote is a high-performance single-page application (SPA) created in pure HTML5, CSS3, and Vanilla JavaScript. It provides curated motivational programming quotes, a deterministic daily quote, dynamic category filtering, search, and a persistent favorites board using browser `localStorage`.

**Why Vanilla JavaScript without frameworks or a database?**  
In an academic DevOps project, the focus is on **pipeline reliability, container footprint, and deterministic testing**. A lightweight vanilla stack:
- Builds in seconds without fragile node dependencies.
- Produces a production Docker image under **25 MB** using `nginx:alpine`.
- Has zero database initialization latency, guaranteeing 100% predictable Kubernetes liveness and readiness probes.

---

## 2. Project File Structure

```text
codequote/
├── app/
│   ├── index.html        # Single-page UI with Tropical Neon theme
│   ├── style.css         # Glassmorphism styling, glow effects, responsive CSS
│   ├── script.js         # 26 quotes array, search, filter, local storage logic
│   └── health.html       # Returns "OK" for Kubernetes liveness & readiness probes
├── tests/
│   └── check.sh          # Automated test suite (checks files, syntax, quote counts)
├── k8s/
│   ├── deployment.yaml   # 2 replicas, RollingUpdate, CPU/RAM limits, health probes
│   └── service.yaml      # NodePort service exposing port 80 to port 30080
├── Dockerfile            # Multi-layer image definition using nginx:alpine
├── .dockerignore         # Strict exclusion list (never excludes Dockerfile)
├── Jenkinsfile           # 7-stage declarative CI/CD pipeline
└── README.md             # Complete report and Viva Voce guide
```

---

## Phase 1: Git & GitHub Version Control

### File to Open
- `.gitignore` (Workspace root)

### Explanation in Simple English
Git tracks every modification made to the codebase. GitHub acts as the remote cloud repository that triggers automated pipelines whenever code is pushed.

### Commands to Run (Step-by-Step)
```bash
# 1. Initialize local Git repository
git init

# 2. Check repository status
git status

# 3. Stage all project files
git add .

# 4. Commit with a meaningful engineering message
git commit -m "feat: initial release of CodeQuote with complete DevOps workflow"

# 5. Link local repo to your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/codequote.git

# 6. Push code to main branch
git branch -M main
git push -u origin main
```

### Expected Output
```text
[main (root-commit) a1b2c3d] feat: initial release of CodeQuote with complete DevOps workflow
 10 files changed, 1200 insertions(+)
To https://github.com/YOUR_GITHUB_USERNAME/codequote.git
 * [new branch]      main -> main
```

### Common Errors & Fixes
- **Error:** `fatal: remote origin already exists.`  
  **Fix:** Run `git remote set-url origin https://github.com/YOUR_USERNAME/codequote.git`
- **Error:** `Authentication failed for git push` in Codespaces.  
  **Fix:** Ensure your GitHub account has workflow permissions or authenticate using a Personal Access Token (PAT).

### 🎓 Phase 1 Viva Notes
- **Q: What is the difference between Git and GitHub?**  
  *Answer:* Git is a local distributed version control software. GitHub is a cloud-hosted service providing Git repository hosting, collaboration, and webhook triggers for CI/CD.
- **Q: Why is commit granularity important in DevOps?**  
  *Answer:* Small, focused commits allow teams to identify the exact change that broke an automated test, facilitating instant rollbacks (`git revert`).

---

## Phase 2: Automated Quality Testing (Bash Test Suite)

### File to Open
- `tests/check.sh`

### Complete Code Highlights
The test script runs 7 automated verification phases:
1. Verifies `app/index.html`, `app/style.css`, `app/script.js`, and `app/health.html` exist and have a file size greater than zero (`-s`).
2. Confirms `<title>` tag contains "CodeQuote".
3. Validates CSS `<link>` and JS `<script>` tags.
4. Checks JavaScript function declarations (`getRandomQuote`, `getDailyQuote`, `copyToClipboard`).
5. Checks that at least 20 quotes exist using regular expressions (`^[[:space:]]*\{[[:space:]]*id:[[:space:]]*[0-9]+`).
6. Runs `node -c app/script.js` to parse AST syntax without executing code.
7. Checks that `app/health.html` outputs `OK`.

### Commands to Run
```bash
# 1. Grant execution permissions
chmod +x tests/check.sh

# 2. Execute automated test suite
./tests/check.sh
```

### Expected Output
```text
======================================================
      CodeQuote Automated DevOps Test Suite          
======================================================
Phase 1: File Presence & Non-Empty Checks
 [PASS] File: app/index.html - File exists and is non-empty (11969 bytes)
 [PASS] File: app/style.css - File exists and is non-empty (18116 bytes)
 [PASS] File: app/script.js - File exists and is non-empty (21442 bytes)
 [PASS] File: app/health.html - File exists and is non-empty (3 bytes)
...
Phase 4: Quote Repository Size Verification
 [PASS] Quote Count - Found 26 quotes (minimum requirement: 20)
...
Test Summary: 16/16 tests passed (0 failures)
ALL TESTS PASSED! Pipeline can proceed to Docker build.
```

### Common Errors & Fixes
- **Error:** `bash: ./tests/check.sh: Permission denied`  
  **Fix:** Run `chmod +x tests/check.sh` before executing.
- **Error:** Exit code 1 indicating fewer than 20 quotes.  
  **Fix:** Check `app/script.js` line formatting. Ensure each quote starts on its own line with `{ id: X, ...`.

### 🎓 Phase 2 Viva Notes
- **Q: Why use exit codes (exit 0 vs exit 1) in automated testing?**  
  *Answer:* CI servers like Jenkins inspect the exit status code (`$?`). An exit code of `0` signals success and continues the build. Any non-zero exit code triggers an immediate pipeline abort.
- **Q: What is the purpose of `node -c`?**  
  *Answer:* It validates the JavaScript syntax without executing the script, catching syntax errors (unclosed brackets, illegal tokens) before deployment.

---

## Phase 3: Containerization with Docker & Nginx

### Files to Open
- `Dockerfile`
- `.dockerignore`

### Explanation in Simple English
Docker bundles the application, the web server (Nginx), and the operating system dependencies into a lightweight, portable container image that runs identically on any machine.

### Key Rules in `.dockerignore`
- Never exclude `Dockerfile`.
- Always exclude `.git`, `node_modules`, `tests`, `k8s`, and documentation to keep image size small.

### Commands to Run
```bash
# 1. Build the Docker image locally
docker build -t codequote:latest -t codequote:v1.0.0 .

# 2. Inspect created Docker image size
docker images | grep codequote

# 3. Run container locally on host port 8080
docker run -d --name codequote-local -p 8080:80 codequote:latest

# 4. Verify running container status
docker ps

# 5. Smoke test the running container via curl
curl -i http://localhost:8080/health.html

# 6. Clean up local test container
docker stop codequote-local && docker rm codequote-local
```

### Expected Output
```text
REPOSITORY    TAG       IMAGE ID       CREATED         SIZE
codequote     latest    d4e5f6a7b8c9   10 seconds ago  23.8MB

HTTP/1.1 200 OK
Server: nginx/1.27.x-alpine
Content-Length: 3
Content-Type: text/html
OK
```

### Common Errors & Fixes
- **Error:** `bind: address already in use` for port 8080.  
  **Fix:** Map to another port: `docker run -d -p 8085:80 codequote:latest`.
- **Error:** `failed to solve: failed to read dockerfile`  
  **Fix:** Ensure you are running the command from the repository root where `Dockerfile` resides.

### 🎓 Phase 3 Viva Notes
- **Q: Why choose `nginx:alpine` instead of `ubuntu` or `node` images?**  
  *Answer:* Alpine Linux is minimal (under 5MB base). Together with Nginx, the total image size is under 25MB, resulting in faster pulls, smaller attack surfaces, and lower memory overhead.
- **Q: Why is `CMD ["nginx", "-g", "daemon off;"]` used?**  
  *Answer:* Docker containers exit when PID 1 finishes. Running Nginx with `daemon off;` forces it to stay in the foreground so the container remains active.

---

## Phase 4: Docker Hub Registry Publishing

### Files to Open
- Terminal / Docker Hub Dashboard (`https://hub.docker.com`)

### Explanation in Simple English
Docker Hub is a public/private container registry. Jenkins pushes the tested Docker image to Docker Hub so that Kubernetes nodes can pull and deploy it.

### Commands to Run
```bash
# 1. Authenticate with Docker Hub (enter username and password/token)
docker login -u YOUR_DOCKERHUB_USERNAME

# 2. Tag the local image with your Docker Hub repository prefix
docker tag codequote:latest YOUR_DOCKERHUB_USERNAME/codequote:1.0.0
docker tag codequote:latest YOUR_DOCKERHUB_USERNAME/codequote:latest

# 3. Push both versioned and latest images to registry
docker push YOUR_DOCKERHUB_USERNAME/codequote:1.0.0
docker push YOUR_DOCKERHUB_USERNAME/codequote:latest

# 4. Verify on Docker Hub
curl -s https://hub.docker.com/v2/repositories/YOUR_DOCKERHUB_USERNAME/codequote/tags | grep "1.0.0"
```

### Expected Output
```text
The push refers to repository [docker.io/YOUR_DOCKERHUB_USERNAME/codequote]
c1b2a3: Pushed
1.0.0: digest: sha256:abcd1234efgh... size: 1155
latest: digest: sha256:abcd1234efgh... size: 1155
```

### Security Warning
⚠️ **NEVER commit Docker passwords or tokens into Git!**  
Always use Jenkins Credentials Manager or environment variables (`--password-stdin`).

### 🎓 Phase 4 Viva Notes
- **Q: Why should we tag images with both build numbers (e.g., `:42`) and `:latest`?**  
  *Answer:* Using unique build numbers creates immutable releases, allowing precise rollback to any prior version. `:latest` provides a convenient pointer to the most recent stable build.
- **Q: What is a Container Registry?**  
  *Answer:* A centralized server-side repository for storing, categorizing, and serving Docker image layers securely over HTTPS.

---

## Phase 5: Jenkins Declarative CI/CD Pipeline

### File to Open
- `Jenkinsfile`

### Complete 7-Stage Pipeline Architecture
```text
[1. Checkout] ➔ [2. Test] ➔ [3. Build Docker] ➔ [4. Container Smoke Test] ➔ [5. Push Registry] ➔ [6. Deploy K8s] ➔ [7. Verify Rollout]
```

1. **Checkout:** Clones the latest commit from Git using `checkout scm`.
2. **Test:** Runs `./tests/check.sh`. If any test fails, build terminates.
3. **Build Docker Image:** Builds the Nginx container tagged with `${BUILD_NUMBER}`.
4. **Container Smoke Test:** Spins up an isolated container, verifies HTTP 200 on `/` and "OK" on `/health.html`, then safely terminates the container in a `finally` block.
5. **Push Image to Docker Hub:** Authenticates using Jenkins credentials ID `dockerhub-credentials` and pushes image tags.
6. **Deploy to Kubernetes:** Dynamically patches image tags in `k8s/deployment.yaml` and executes `kubectl apply`.
7. **Verify Deployment:** Runs `kubectl rollout status` and prints pod status.

### Setting Up Jenkins Credentials (No hardcoding)
1. In Jenkins: Go to **Manage Jenkins** ➔ **Credentials** ➔ **System** ➔ **Global credentials**.
2. Click **Add Credentials**:
   - Kind: `Username with password`
   - Scope: `Global`
   - Username: `YOUR_DOCKERHUB_USERNAME`
   - Password: `YOUR_DOCKERHUB_TOKEN`
   - ID: `dockerhub-credentials`

### 🎓 Phase 5 Viva Notes
- **Q: What is the difference between Scripted and Declarative Jenkins pipelines?**  
  *Answer:* Declarative pipelines use a structured, opinionated syntax (`pipeline { stage { steps } }`) with built-in post-actions and error handling. Scripted pipelines use Groovy scripting directly and are more complex.
- **Q: Why is the Smoke Test stage necessary before pushing to Docker Hub?**  
  *Answer:* Unit tests test code in isolation. The container smoke test validates that the actual Nginx web server starts cleanly and serves files before shipping to the registry.

---

## Phase 6: Kubernetes Cluster Orchestration & Self-Healing

### Files to Open
- `k8s/deployment.yaml`
- `k8s/service.yaml`

### Key Manifest Configurations
- **Replicas: 2** — High availability across nodes.
- **RollingUpdate Strategy:** `maxSurge: 1`, `maxUnavailable: 0` ensures zero-downtime updates.
- **Resource Management:** Requests `50m` CPU / `32Mi` RAM; Limits `200m` CPU / `128Mi` RAM.
- **Probes:**
  - `readinessProbe`: Targets `/health.html` on port 80 (checks if Nginx is ready to accept client traffic).
  - `livenessProbe`: Targets `/health.html` on port 80 (detects frozen processes and triggers automatic pod restarts).
- **Service:** Exposes port 80 internally and `nodePort: 30080` externally.

### Commands to Run (in Minikube, K3s, or Kind)
```bash
# 1. Apply Deployment and Service manifests
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# 2. Check deployment rollout status
kubectl rollout status deployment/codequote-deployment

# 3. View running pods with IP addresses
kubectl get pods -l app=codequote -o wide

# 4. View service details
kubectl get svc codequote-service

# 5. Access the app using port-forwarding (in Codespaces)
kubectl port-forward svc/codequote-service 8080:80
```

### Testing Self-Healing & Rolling Updates
```bash
# Delete a healthy pod to watch Kubernetes recreate it automatically:
kubectl delete pod -l app=codequote --now
kubectl get pods -l app=codequote -w

# Trigger a zero-downtime rolling update:
kubectl set image deployment/codequote-deployment codequote-container=yourdockerhubuser/codequote:v2.0.0
kubectl rollout status deployment/codequote-deployment
```

### Expected Output
```text
deployment.apps/codequote-deployment created
service/codequote-service created
Waiting for deployment "codequote-deployment" rollout to finish: 0 of 2 updated replicas are available...
deployment "codequote-deployment" successfully rolled out

NAME                                    READY   STATUS    RESTARTS   AGE
codequote-deployment-7d9f8c6b54-a1b2c   1/1     Running   0          35s
codequote-deployment-7d9f8c6b54-x9y8z   1/1     Running   0          35s
```

### 🎓 Phase 6 Viva Notes
- **Q: What is the difference between a Liveness Probe and a Readiness Probe?**  
  *Answer:*
  - **Readiness Probe:** Determines if the container is ready to receive network traffic. If it fails, Kubernetes removes the pod from Service endpoints without killing it.
  - **Liveness Probe:** Determines if the container is healthy. If it fails, Kubernetes kills and restarts the container to recover from deadlocks.
- **Q: What does `maxUnavailable: 0` mean in a RollingUpdate?**  
  *Answer:* It guarantees that Kubernetes will never terminate an old pod until the new replacement pod has passed its readiness probe, achieving true zero downtime.

---

## 9. Comprehensive College Viva Voce Master Cheat Sheet

| Question | Short, High-Scoring Answer | Key Terms to Mention |
|---|---|---|
| **What is DevOps?** | A cultural philosophy and set of practices combining software development (Dev) and IT operations (Ops) to shorten the systems development life cycle while delivering features, fixes, and updates frequently and reliably. | Continuous Integration, Continuous Delivery, Automation, Feedback Loops |
| **Why is CodeQuote built without a backend framework?** | To demonstrate that DevOps principles apply to any software artifact, keeping the container footprint minimal (<25MB) and the deployment deterministic. | Micro-footprint, Nginx Alpine, Stateless |
| **What is the difference between CI and CD?** | Continuous Integration automatically merges and tests code changes. Continuous Delivery automatically packages and stages the release candidate for deployment to production. | Automated Testing, Artifact Repository, Pipeline Gates |
| **What happens if a pod crashes in Kubernetes?** | The ReplicaSet controller detects the discrepancy between desired state (2 replicas) and current state (1 replica), immediately launching a new pod. | Desired State Reconciliation, Self-Healing, Kube-Controller-Manager |
| **Why not store secrets in Git?** | Git histories are immutable and distributed. Pushing secrets compromises infrastructure security. We inject secrets at runtime via Jenkins Credentials or Kubernetes Secrets. | Credential Masking, RBAC, Secret Management |

---

## 👨‍🎓 Project Defense Summary
*"CodeQuote proves an end-to-end cloud-native software lifecycle. Starting with developer commits in Git, automated unit and semantic tests in Bash validate code integrity. The application is packaged into a hardened Alpine Nginx image, validated via containerized smoke tests, registered on Docker Hub, and deployed via a declarative Jenkins pipeline into a self-healing Kubernetes cluster with zero-downtime rolling updates."*
