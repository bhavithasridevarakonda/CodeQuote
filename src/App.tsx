import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Terminal,
  Layers,
  Cpu,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Share2,
  Heart,
  Sparkles,
  RefreshCw,
  Play,
  Search,
  Server,
  Box,
  ShieldCheck,
  BookOpen,
  ExternalLink,
  FileText,
  ChevronRight,
  Flame,
  Zap,
  Menu,
  X,
  Code2,
  GitBranch,
  Container,
  Activity,
  Award
} from "lucide-react";

// The exact 26 quotes from app/script.js
interface Quote {
  id: number;
  text: string;
  author: string;
  category: "Programming" | "Learning" | "Creativity" | "Discipline" | "Motivation";
}

const QUOTES_DATA: Quote[] = [
  { id: 1, text: "Talk is cheap. Show me the code.", author: "Linus Torvalds", category: "Programming" },
  { id: 2, text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson", category: "Programming" },
  { id: 3, text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler", category: "Programming" },
  { id: 4, text: "First, solve the problem. Then, write the code.", author: "John Johnson", category: "Programming" },
  { id: 5, text: "Simplicity is prerequisite for reliability.", author: "Edsger W. Dijkstra", category: "Programming" },
  { id: 6, text: "Make it work, make it right, make it fast.", author: "Kent Beck", category: "Programming" },
  { id: 7, text: "The only way to learn a new programming language is by writing programs in it.", author: "Dennis Ritchie", category: "Learning" },
  { id: 8, text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi", category: "Learning" },
  { id: 9, text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", author: "Benjamin Franklin", category: "Learning" },
  { id: 10, text: "The expert in anything was once a beginner.", author: "Helen Hayes", category: "Learning" },
  { id: 11, text: "Curiosity is the engine of achievement.", author: "Ken Robinson", category: "Learning" },
  { id: 12, text: "Creativity is intelligence having fun.", author: "Albert Einstein", category: "Creativity" },
  { id: 13, text: "You can't use up creativity. The more you use, the more you have.", author: "Maya Angelou", category: "Creativity" },
  { id: 14, text: "The computer was born to solve problems that did not exist before.", author: "Bill Gates", category: "Creativity" },
  { id: 15, text: "Good software, like wine, takes time and craftsmanship.", author: "Joel Spolsky", category: "Creativity" },
  { id: 16, text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn", category: "Discipline" },
  { id: 17, text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant", category: "Discipline" },
  { id: 18, text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma", category: "Discipline" },
  { id: 19, text: "Success is nothing more than a few simple disciplines, practiced every day.", author: "Jim Rohn", category: "Discipline" },
  { id: 20, text: "The most difficult thing is the decision to act, the rest is merely tenacity.", author: "Amelia Earhart", category: "Discipline" },
  { id: 21, text: "It always seems impossible until it is done.", author: "Nelson Mandela", category: "Motivation" },
  { id: 22, text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "Motivation" },
  { id: 23, text: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "Motivation" },
  { id: 24, text: "Opportunities don't happen, you create them.", author: "Chris Grosser", category: "Motivation" },
  { id: 25, text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "Motivation" },
  { id: 26, text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs", category: "Motivation" }
];

const FAVORITES_KEY = "codequote_favorites";

// Deterministic daily quote algorithm matching app/script.js
function calculateDailyQuote(date = new Date()): Quote {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const seed = year * 10000 + month * 100 + day;
  const index = Math.abs(seed) % QUOTES_DATA.length;
  return QUOTES_DATA[index];
}

interface ToastItem {
  id: string;
  message: string;
  type: "cyan" | "pink" | "error";
}

interface VivaQuestion {
  phase: string;
  question: string;
  answer: string;
  keywords: string[];
}

const VIVA_QUESTIONS: VivaQuestion[] = [
  {
    phase: "Git & GitHub",
    question: "Why do we use .dockerignore and .gitignore in our project?",
    answer: "To prevent sensitive secrets, local caches, node_modules, and test files from being pushed to public GitHub repositories or bloated into Docker image layers. This enforces security and keeps images under 25MB.",
    keywords: [".dockerignore", "Layer Caching", "Attack Surface Reduction", "Zero Secret Leakage"]
  },
  {
    phase: "Automated Testing",
    question: "Why does tests/check.sh check app/health.html and how does it affect Jenkins?",
    answer: "app/health.html is required by Kubernetes liveness and readiness probes. The Bash script tests if it outputs 'OK'. If any check fails, the script exits with status code 1 ($?), which signals Jenkins to immediately halt the pipeline and prevent bad deployments.",
    keywords: ["Exit Code ($?)", "exit 0 vs exit 1", "Fail-Fast Principle", "HTTP Health Probe"]
  },
  {
    phase: "Docker & Nginx",
    question: "Why did you choose nginx:alpine over an Ubuntu or Node.js base image?",
    answer: "Alpine Linux uses musl libc and BusyBox, creating a base image of only ~5MB. Together with Nginx, the final CodeQuote image is <25MB, whereas Ubuntu would be >150MB. Smaller images download faster in Kubernetes and have a dramatically smaller CVE attack surface.",
    keywords: ["nginx:alpine", "Minimal Attack Surface", "<25MB Image", "Fast Pull Time"]
  },
  {
    phase: "Docker Hub",
    question: "Why should we tag Docker images with ${BUILD_NUMBER} instead of only :latest?",
    answer: "Tagging with immutable build numbers (e.g. codequote:42) ensures every release is permanently versioned. If a regression occurs in production, Kubernetes can roll back to a known good image tag instantly without ambiguity.",
    keywords: ["Immutable Tags", "Auditability", "Rollback Precision", "Build Traceability"]
  },
  {
    phase: "Jenkins CI/CD",
    question: "What is a Container Smoke Test and why run it before pushing to Docker Hub?",
    answer: "Unit tests only test code syntax. The Smoke Test starts a real container on a temporary port (8088), issues an HTTP GET request to / and /health.html via curl, and checks for 200 OK. This guarantees Nginx actually starts before pushing bad images to the cloud registry.",
    keywords: ["Smoke Testing", "curl HTTP Verification", "Fail before Push", "Ephemeral Container Cleanup"]
  },
  {
    phase: "Kubernetes",
    question: "What is the difference between a Liveness Probe and a Readiness Probe?",
    answer: "A Readiness Probe checks if the pod is ready to accept user traffic (if it fails, Kubernetes removes the pod from the Service load balancer). A Liveness Probe checks if the pod is alive (if it fails, kubelet kills and restarts the container).",
    keywords: ["Readiness (traffic routing)", "Liveness (container restart)", "Zero Downtime", "Self-Healing"]
  },
  {
    phase: "Kubernetes",
    question: "How does maxSurge: 1 and maxUnavailable: 0 achieve zero downtime during RollingUpdate?",
    answer: "maxSurge: 1 creates one extra pod with the new version first. maxUnavailable: 0 guarantees that no existing pods are terminated until the new pod passes its readiness probe and enters the 'Running' state. Users never experience dropped connections.",
    keywords: ["RollingUpdate", "maxSurge", "maxUnavailable: 0", "Zero Downtime"]
  }
];

export default function App() {
  // Navigation & Active View Mode
  const [activeTab, setActiveTab] = useState<"website" | "pipeline" | "k8s" | "files" | "viva">("website");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Quote State
  const [featuredQuote, setFeaturedQuote] = useState<Quote>(QUOTES_DATA[0]);
  const [favorites, setFavorites] = useState<Quote[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Daily quote memoized
  const dailyQuote = useMemo(() => calculateDailyQuote(), []);

  // Pipeline Simulation State
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);
  const [buildNumber, setBuildNumber] = useState(42);

  // K8s Simulator State
  const [pods, setPods] = useState([
    { id: "codequote-7d9f8c6b54-x9q2m", version: "v1.0.0", status: "Running", ready: "1/1", restarts: 0, age: "14m", cpu: "12m", mem: "24Mi", healthy: true },
    { id: "codequote-7d9f8c6b54-k8v4p", version: "v1.0.0", status: "Running", ready: "1/1", restarts: 0, age: "14m", cpu: "14m", mem: "26Mi", healthy: true }
  ]);
  const [k8sEventLog, setK8sEventLog] = useState<string[]>([
    "Normal  Scheduled   pod/codequote-7d9f8c6b54-x9q2m Successfully assigned default to minikube-worker-01",
    "Normal  Pulled      Container image 'codequote:v1.0.0' already present on machine",
    "Normal  Created     Created container codequote-container",
    "Normal  Started     Started container codequote-container",
    "Normal  Endpoints   Service codequote-service endpoints synchronized with 2 healthy targets"
  ]);

  // Selected file in file explorer
  const [selectedFileName, setSelectedFileName] = useState<string>("Dockerfile");
  const [copiedFile, setCopiedFile] = useState(false);

  // Active Viva category
  const [vivaFilter, setVivaFilter] = useState<string>("All");

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load favorites from localStorage:", e);
    }
  }, []);

  // Toast Helper
  const triggerToast = (message: string, type: "cyan" | "pink" | "error" = "cyan") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  // Toggle Favorite
  const toggleFavoriteQuote = (quote: Quote) => {
    setFavorites((prev) => {
      const exists = prev.some((q) => q.id === quote.id);
      let updated: Quote[];
      if (exists) {
        updated = prev.filter((q) => q.id !== quote.id);
        triggerToast("Quote removed from favorites", "pink");
      } else {
        updated = [...prev, quote];
        triggerToast("Quote saved to favorites!", "pink");
      }
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const isFavorited = (quoteId: number) => {
    return favorites.some((q) => q.id === quoteId);
  };

  // Copy with fallback
  const handleCopy = async (text: string, label = "Copied to clipboard!") => {
    try {
      await navigator.clipboard.writeText(text);
      triggerToast(label, "cyan");
    } catch {
      triggerToast("Clipboard copy failed", "error");
    }
  };

  // Share with fallback
  const handleShare = async (quote: Quote) => {
    const textToShare = `"${quote.text}" — ${quote.author}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "CodeQuote Inspiration",
          text: textToShare,
          url: window.location.href
        });
        triggerToast("Shared successfully!", "pink");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          handleCopy(textToShare, "Share text copied to clipboard!");
        }
      }
    } else {
      handleCopy(textToShare, "Share text copied to clipboard!");
    }
  };

  // Get a fresh random quote
  const loadRandomFeaturedQuote = () => {
    let next: Quote;
    do {
      next = QUOTES_DATA[Math.floor(Math.random() * QUOTES_DATA.length)];
    } while (next.id === featuredQuote.id && QUOTES_DATA.length > 1);
    setFeaturedQuote(next);
    triggerToast("Fresh inspiration loaded!", "cyan");
  };

  // Filtered explorer quotes
  const filteredQuotes = useMemo(() => {
    return QUOTES_DATA.filter((q) => {
      const matchCat = selectedCategory === "All" || q.category === selectedCategory;
      const qLow = searchQuery.toLowerCase().trim();
      const matchSearch =
        qLow === "" ||
        q.text.toLowerCase().includes(qLow) ||
        q.author.toLowerCase().includes(qLow) ||
        q.category.toLowerCase().includes(qLow);
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Jenkins Pipeline Simulation Execution
  const runJenkinsPipeline = () => {
    if (pipelineRunning) return;
    setPipelineRunning(true);
    setCurrentStageIndex(0);
    setPipelineLogs([]);
    const nextBuild = buildNumber + 1;
    setBuildNumber(nextBuild);

    const stages = [
      {
        name: "Checkout",
        logs: [
          `[Pipeline] Start of Pipeline (Build #${nextBuild})`,
          `[Pipeline] node {`,
          `[Stage: Checkout] Checking out from revision git@github.com:user/codequote.git`,
          `[Stage: Checkout] > git fetch --tags --progress`,
          `[Stage: Checkout] > git checkout -f e9b87a41`,
          `[Stage: Checkout] Commit: e9b87a41 by DevOps Student - feat: deploy update`
        ],
        delay: 1000
      },
      {
        name: "Test",
        logs: [
          `[Stage: Test] Executing tests/check.sh...`,
          `[PASS] File: app/index.html non-empty (11,969 bytes)`,
          `[PASS] File: app/style.css non-empty (18,116 bytes)`,
          `[PASS] File: app/script.js non-empty (21,442 bytes)`,
          `[PASS] File: app/health.html non-empty (3 bytes)`,
          `[PASS] HTML Title: <title>CodeQuote - Developer Inspiration & DevOps Workflow</title>`,
          `[PASS] JavaScript syntax validation (node -c) PASSED`,
          `[PASS] Quote count: 26 quotes detected (>=20 threshold)`,
          `[PASS] Kubernetes probe check: health.html outputs 'OK'`,
          `[Stage: Test] 16/16 tests passed. Exit code 0.`
        ],
        delay: 1500
      },
      {
        name: "Build Docker Image",
        logs: [
          `[Stage: Build Docker Image] docker build --tag codequote:${nextBuild} --tag codequote:latest .`,
          `Step 1/5 : FROM nginx:alpine`,
          `Step 2/5 : LABEL maintainer="student@college.edu" app.name="codequote"`,
          `Step 3/5 : RUN rm -rf /usr/share/nginx/html/*`,
          `Step 4/5 : COPY app/ /usr/share/nginx/html/`,
          `Step 5/5 : EXPOSE 80`,
          `Successfully built 4c89ba71e0. Tagged codequote:${nextBuild} (Image size: 23.8MB)`
        ],
        delay: 1800
      },
      {
        name: "Container Smoke Test",
        logs: [
          `[Stage: Container Smoke Test] docker run -d --name codequote-smoke-${nextBuild} -p 8088:80 codequote:${nextBuild}`,
          `[Stage: Container Smoke Test] Waiting 2s for Nginx process...`,
          `[Stage: Container Smoke Test] curl -s -o /dev/null -w "%{http_code}" http://localhost:8088/`,
          `[PASS] HTTP 200 OK returned from container root`,
          `[Stage: Container Smoke Test] curl -s http://localhost:8088/health.html`,
          `[PASS] Probe returned 'OK'`,
          `[Stage: Container Smoke Test] Cleaning up temporary smoke container codequote-smoke-${nextBuild}`
        ],
        delay: 1500
      },
      {
        name: "Push Image to Docker Hub",
        logs: [
          `[Stage: Push Image to Docker Hub] withCredentials([usernamePassword: 'dockerhub-credentials'])`,
          `[Stage: Push Image to Docker Hub] Logging in as **** with Docker token`,
          `[Stage: Push Image to Docker Hub] Login Succeeded`,
          `[Stage: Push Image to Docker Hub] Pushing codequote:${nextBuild}...`,
          `[Stage: Push Image to Docker Hub] 7d9a1b: Layer already exists`,
          `[Stage: Push Image to Docker Hub] 4c89ba: Pushed [23.8MB]`,
          `[Stage: Push Image to Docker Hub] digest: sha256:7f4a... size: 948`
        ],
        delay: 1400
      },
      {
        name: "Deploy to Kubernetes",
        logs: [
          `[Stage: Deploy to Kubernetes] Updating k8s/deployment.yaml with image codequote:${nextBuild}`,
          `[Stage: Deploy to Kubernetes] kubectl apply -f k8s/deployment.yaml --namespace=default`,
          `deployment.apps/codequote-deployment configured`,
          `[Stage: Deploy to Kubernetes] kubectl apply -f k8s/service.yaml --namespace=default`,
          `service/codequote-service unchanged`
        ],
        delay: 1300
      },
      {
        name: "Verify Deployment",
        logs: [
          `[Stage: Verify Deployment] kubectl rollout status deployment/codequote-deployment`,
          `Waiting for deployment "codequote-deployment" rollout to finish: 1 of 2 updated replicas are available...`,
          `deployment "codequote-deployment" successfully rolled out`,
          `[PASS] Pod 1: 1/1 Running | IP: 10.244.0.18`,
          `[PASS] Pod 2: 1/1 Running | IP: 10.244.0.19`,
          `[Pipeline] SUCCESS: Build #${nextBuild} completed with 0 errors!`
        ],
        delay: 1400
      }
    ];

    let current = 0;
    const executeNextStage = () => {
      if (current >= stages.length) {
        setPipelineRunning(false);
        triggerToast(`Jenkins Build #${nextBuild} Succeeded!`, "cyan");
        // Update pods in simulator
        setPods([
          { id: `codequote-roll-${nextBuild}-a`, version: `v${nextBuild}.0`, status: "Running", ready: "1/1", restarts: 0, age: "10s", cpu: "10m", mem: "22Mi", healthy: true },
          { id: `codequote-roll-${nextBuild}-b`, version: `v${nextBuild}.0`, status: "Running", ready: "1/1", restarts: 0, age: "10s", cpu: "11m", mem: "23Mi", healthy: true }
        ]);
        return;
      }

      setCurrentStageIndex(current);
      setPipelineLogs((prev) => [...prev, ...stages[current].logs]);

      setTimeout(() => {
        current++;
        executeNextStage();
      }, stages[current].delay);
    };

    executeNextStage();
  };

  // Kubernetes Self-Healing Simulation
  const simulatePodCrash = (index: number) => {
    const targetPod = pods[index];
    if (!targetPod || !targetPod.healthy) return;

    triggerToast(`Simulating Crash on ${targetPod.id}...`, "error");

    // 1. Mark pod Terminated/Error
    setPods((prev) =>
      prev.map((p, i) => (i === index ? { ...p, status: "CrashLoopBackOff", ready: "0/1", healthy: false } : p))
    );

    setK8sEventLog((prev) => [
      `Warning  Unhealthy  Liveness probe failed for ${targetPod.id}: HTTP probe failed with statuscode: 500`,
      `Normal   Killing    Killing container codequote-container with id docker://${targetPod.id.slice(-6)}`,
      `Normal   SuccessfulCreate  Created new replacement pod to satisfy desired replicas=2`,
      ...prev
    ]);

    // 2. Self-healing kicks in after 2 seconds
    setTimeout(() => {
      const newId = `codequote-heal-${Math.random().toString(36).substring(2, 7)}`;
      setPods((prev) =>
        prev.map((p, i) =>
          i === index
            ? { ...p, id: newId, status: "Running", ready: "1/1", restarts: targetPod.restarts + 1, age: "3s", healthy: true }
            : p
        )
      );
      triggerToast(`Kubernetes Self-Healed! New Pod ${newId} is Ready.`, "cyan");
    }, 2400);
  };

  // Code Manifests content dictionary
  const MANIFESTS: Record<string, { desc: string; code: string; lang: string }> = {
    "Dockerfile": {
      desc: "Multi-layer production Dockerfile using nginx:alpine. Under 25MB footprint, exposes port 80.",
      lang: "dockerfile",
      code: `# ==============================================================================
# CodeQuote Production Dockerfile
# Based on ultra-lightweight Nginx Alpine image (<25MB)
# Exposes Port 80 for Web Traffic and Kubernetes Health Probes
# ==============================================================================

FROM nginx:alpine

# Metadata labels for container governance & viva presentation
LABEL maintainer="student@college.edu" \\
      app.name="codequote" \\
      app.description="Developer inspiration website with full DevOps pipeline" \\
      app.version="1.0.0"

# Remove default Nginx welcome assets
RUN rm -rf /usr/share/nginx/html/*

# Copy pure HTML, CSS, JavaScript, and health.html into the Nginx document root
COPY app/ /usr/share/nginx/html/

# Expose HTTP port 80
EXPOSE 80

# Start Nginx in the foreground so the container doesn't terminate
CMD ["nginx", "-g", "daemon off;"]`
    },
    ".dockerignore": {
      desc: "Strict exclusion list to ensure secrets, tests, and build artifacts never enter the Docker image.",
      lang: "text",
      code: `# Git and version control
.git/
.gitignore

# Environment and secrets (Security rule: never leak keys into Docker image)
.env
.env.*
*.secret
*.pem
*.key

# Node and build artifacts
node_modules/
dist/
build/
.aistudio/

# Tests & CI/CD workflow assets (only app/ is needed in production image)
tests/
k8s/
Jenkinsfile
README.md
docs/
*.md

# Editor and OS junk
.DS_Store
Thumbs.db
.idea/
.vscode/`
    },
    "Jenkinsfile": {
      desc: "Declarative 7-stage CI/CD pipeline with credential masking, smoke test, and Kubernetes deployment.",
      lang: "groovy",
      code: `pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-credentials'
        KUBECONFIG_CREDENTIALS_ID = 'k8s-kubeconfig'
        IMAGE_NAME = 'yourdockerhubuser/codequote'
        APP_PORT = '80'
        SMOKE_TEST_PORT = '8088'
        K8S_NAMESPACE = 'default'
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Stage 1: Checking out source code from Git"
                checkout scm
                sh 'git log -1 --pretty=format:"Commit: %h by %an - %s (%ci)"'
            }
        }

        stage('Test') {
            steps {
                echo "Stage 2: Running Automated Shell Test Suite"
                sh 'chmod +x tests/check.sh'
                sh './tests/check.sh'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Stage 3: Building Nginx Alpine Docker Image"
                sh "docker build --tag \${IMAGE_NAME}:\${BUILD_NUMBER} --tag \${IMAGE_NAME}:latest ."
            }
        }

        stage('Container Smoke Test') {
            steps {
                echo "Stage 4: Running Container Smoke Test"
                script {
                    try {
                        sh "docker run -d --name codequote-smoke-\${BUILD_NUMBER} -p \${SMOKE_TEST_PORT}:80 \${IMAGE_NAME}:\${BUILD_NUMBER}"
                        sh 'sleep 3'
                        sh "curl -s -o /dev/null -w '%{http_code}' http://localhost:\${SMOKE_TEST_PORT}/ | grep -q '200'"
                        sh "curl -s http://localhost:\${SMOKE_TEST_PORT}/health.html | grep -q 'OK'"
                    } finally {
                        sh "docker rm -f codequote-smoke-\${BUILD_NUMBER} || true"
                    }
                }
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                echo "Stage 5: Secure Docker Hub Authentication & Push"
                withCredentials([usernamePassword(credentialsId: env.DOCKERHUB_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo "\$DOCKER_PASS" | docker login -u "\$DOCKER_USER" --password-stdin
                        docker push \${IMAGE_NAME}:\${BUILD_NUMBER}
                        docker push \${IMAGE_NAME}:latest
                        docker logout
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo "Stage 6: Deploying to Kubernetes Cluster"
                sh """
                    sed -i.bak 's|image:.*|image: \${IMAGE_NAME}:\${BUILD_NUMBER}|g' k8s/deployment.yaml
                    kubectl apply -f k8s/deployment.yaml --namespace=\${K8S_NAMESPACE}
                    kubectl apply -f k8s/service.yaml --namespace=\${K8S_NAMESPACE}
                """
            }
        }

        stage('Verify Deployment') {
            steps {
                echo "Stage 7: Verifying Rolling Update Rollout"
                sh "kubectl rollout status deployment/codequote-deployment --namespace=\${K8S_NAMESPACE} --timeout=90s"
                sh "kubectl get pods -l app=codequote --namespace=\${K8S_NAMESPACE} -o wide"
            }
        }
    }

    post {
        always { sh 'docker image prune -f || true' }
        success { echo "SUCCESS: CodeQuote \${BUILD_NUMBER} deployed successfully!" }
        failure { echo "FAILURE: Pipeline failed! Check logs." }
    }
}`
    },
    "k8s/deployment.yaml": {
      desc: "Kubernetes Deployment manifest with 2 replicas, RollingUpdate, CPU/Memory limits, and probes.",
      lang: "yaml",
      code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: codequote-deployment
  labels:
    app: codequote
    tier: frontend
    project: devops-college
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # Allows 1 extra pod during rolling update
      maxUnavailable: 0  # Guarantees zero downtime by never dropping below 2 healthy pods
  selector:
    matchLabels:
      app: codequote
  template:
    metadata:
      labels:
        app: codequote
        tier: frontend
    spec:
      containers:
      - name: codequote-container
        image: yourdockerhubuser/codequote:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 80
          name: http
          protocol: TCP

        resources:
          requests:
            cpu: "50m"
            memory: "32Mi"
          limits:
            cpu: "200m"
            memory: "128Mi"

        readinessProbe:
          httpGet:
            path: /health.html
            port: 80
          initialDelaySeconds: 3
          periodSeconds: 5
          timeoutSeconds: 2
          successThreshold: 1
          failureThreshold: 2

        livenessProbe:
          httpGet:
            path: /health.html
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
          timeoutSeconds: 2
          successThreshold: 1
          failureThreshold: 3`
    },
    "k8s/service.yaml": {
      desc: "Kubernetes Service exposing port 80 to nodePort 30080 targeting pods labeled app: codequote.",
      lang: "yaml",
      code: `apiVersion: v1
kind: Service
metadata:
  name: codequote-service
  labels:
    app: codequote
    tier: frontend
spec:
  type: NodePort
  selector:
    app: codequote
  ports:
  - name: http
    port: 80         # Internal cluster port
    targetPort: 80   # Port on container running Nginx
    nodePort: 30080  # External worker node port`
    },
    "tests/check.sh": {
      desc: "Bash automated test suite verifying non-empty files, syntax, 20+ quotes, and Kubernetes health probe.",
      lang: "bash",
      code: `#!/usr/bin/env bash
set -o pipefail

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

report_result() {
  local test_name="$1"
  local status="$2"
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  if [ "$status" -eq 0 ]; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo "[PASS] $test_name"
  else
    FAILED_TESTS=$((FAILED_TESTS + 1))
    echo "[FAIL] $test_name"
  fi
}

# 1. Non-empty file checks
for file in "app/index.html" "app/style.css" "app/script.js" "app/health.html"; do
  [ -f "$file" ] && [ -s "$file" ] && report_result "$file exists" 0 || report_result "$file exists" 1
done

# 2. Title & Links
grep -q -i "<title>.*CodeQuote.*</title>" app/index.html && report_result "HTML Title" 0 || report_result "HTML Title" 1
grep -q 'href="style.css"' app/index.html && report_result "CSS Link" 0 || report_result "CSS Link" 1
grep -q 'src="script.js"' app/index.html && report_result "JS Script Link" 0 || report_result "JS Script Link" 1

# 3. Core Functions
for fn in "getRandomQuote" "getDailyQuote" "copyToClipboard"; do
  grep -q -E "function[[:space:]]+$fn|const[[:space:]]+$fn" app/script.js && report_result "Function $fn" 0 || report_result "Function $fn" 1
done

# 4. Quote count >= 20
quotes_count=$(grep -c -E "^[[:space:]]*\\{[[:space:]]*id:[[:space:]]*[0-9]+" app/script.js || true)
[ "$quotes_count" -ge 20 ] && report_result "Quote count ($quotes_count >= 20)" 0 || report_result "Quote count ($quotes_count >= 20)" 1

# 5. JS Syntax
command -v node >/dev/null 2>&1 && node -c app/script.js >/dev/null 2>&1 && report_result "Syntax check" 0

# 6. Kubernetes Health Probe
grep -q "OK" app/health.html && report_result "Probe check" 0 || report_result "Probe check" 1

[ "$FAILED_TESTS" -eq 0 ] && exit 0 || exit 1`
    },
    "app/health.html": {
      desc: "Minimal 3-byte file returning 'OK' consumed by Kubernetes Readiness and Liveness Probes.",
      lang: "html",
      code: `OK`
    }
  };

  return (
    <div className="min-h-screen bg-[#060814] text-[#f0f6fc] font-sans flex flex-col selection:bg-[#ff007f] selection:text-white">
      {/* Top Application Header & Mode Switcher */}
      <header className="sticky top-0 z-50 bg-[#060814]/90 backdrop-blur-md border-b border-[#00f0ff]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <a
              href="#home"
              onClick={() => setActiveTab("website")}
              className="flex items-center gap-1.5 text-xl font-extrabold tracking-tight cursor-pointer"
            >
              <span className="text-[#00f0ff] drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">&lt;</span>
              <span>Code</span>
              <span className="text-[#ff007f] drop-shadow-[0_0_10px_rgba(255,0,127,0.8)]">Quote</span>
              <span className="text-[#00f0ff] drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">/&gt;</span>
            </a>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">
              DevOps Suite
            </span>
          </div>

          {/* Desktop Tab Selector */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#0e1224]/80 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab("website")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "website"
                  ? "bg-[#00f0ff] text-[#060814] font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Website</span>
            </button>

            <button
              onClick={() => setActiveTab("pipeline")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "pipeline"
                  ? "bg-[#ff007f] text-white font-bold shadow-[0_0_15px_rgba(255,0,127,0.4)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Jenkins Pipeline</span>
            </button>

            <button
              onClick={() => setActiveTab("k8s")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "k8s"
                  ? "bg-[#00f0ff] text-[#060814] font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>K8s Cluster Visualizer</span>
            </button>

            <button
              onClick={() => setActiveTab("files")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "files"
                  ? "bg-white/15 text-white font-bold border border-white/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Manifests & Code</span>
            </button>

            <button
              onClick={() => setActiveTab("viva")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "viva"
                  ? "bg-gradient-to-r from-[#ff007f] to-[#00f0ff] text-white font-bold shadow-[0_0_15px_rgba(255,0,127,0.4)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>College Viva Prep</span>
            </button>
          </nav>

          {/* Direct Raw Link & Mobile Hamburger */}
          <div className="flex items-center gap-2">
            <a
              href="/app/index.html"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-[#00f0ff] bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/30 transition"
              title="Open pure vanilla HTML5/CSS/JS standalone file"
            >
              <span>Raw Standalone</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 border border-white/10"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 pt-2 pb-4 space-y-1 bg-[#0a0d1d] border-b border-[#00f0ff]/20">
            <button
              onClick={() => {
                setActiveTab("website");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#00f0ff]" /> Live Website
            </button>
            <button
              onClick={() => {
                setActiveTab("pipeline");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5 flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-[#ff007f]" /> Jenkins Pipeline Runner
            </button>
            <button
              onClick={() => {
                setActiveTab("k8s");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5 flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-[#00f0ff]" /> K8s Cluster Visualizer
            </button>
            <button
              onClick={() => {
                setActiveTab("files");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-purple-400" /> Manifests & Code
            </button>
            <button
              onClick={() => {
                setActiveTab("viva");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5 flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-[#ff007f]" /> College Viva Prep
            </button>
          </div>
        )}
      </header>

      {/* Main Body Switcher */}
      <main className="flex-1">
        {/* ========================================================================= */}
        {/* MODE 1: LIVE CODEQUOTE WEBSITE */}
        {/* ========================================================================= */}
        {activeTab === "website" && (
          <div className="relative">
            {/* Sub-navigation for sections */}
            <div className="bg-[#0e1224]/40 border-b border-white/5 py-2.5 px-4 sticky top-16 z-40 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto flex items-center justify-between text-xs overflow-x-auto gap-4">
                <div className="flex items-center gap-4">
                  <a href="#hero" className="text-slate-400 hover:text-[#00f0ff] transition whitespace-nowrap">Home</a>
                  <a href="#featured" className="text-slate-400 hover:text-[#00f0ff] transition whitespace-nowrap">Featured</a>
                  <a href="#daily" className="text-slate-400 hover:text-[#ff007f] transition whitespace-nowrap">Quote of the Day</a>
                  <a href="#explorer" className="text-slate-400 hover:text-[#00f0ff] transition whitespace-nowrap">Quote Explorer</a>
                  <a href="#favorites" className="text-slate-400 hover:text-[#ff007f] transition whitespace-nowrap flex items-center gap-1">
                    Favorites
                    {favorites.length > 0 && (
                      <span className="bg-[#ff007f] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {favorites.length}
                      </span>
                    )}
                  </a>
                  <a href="#about" className="text-slate-400 hover:text-[#00f0ff] transition whitespace-nowrap">About DevOps</a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 hidden sm:inline">Theme:</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">
                    Tropical Neon
                  </span>
                </div>
              </div>
            </div>

            {/* 1. Hero Section */}
            <section id="hero" className="relative py-20 px-4 text-center overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-[#00f0ff]/15 to-[#ff007f]/15 rounded-full blur-[90px] pointer-events-none" />
              
              <div className="relative max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono text-[#00f0ff] bg-[#00f0ff]/10 border border-[#00f0ff]/30 mb-6 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                  <Zap className="w-3.5 h-3.5 text-[#ff007f]" />
                  <span>Pure Vanilla SPA • Automated Tests • Docker • Jenkins • Kubernetes</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-6">
                  Ignite Your Code with <br />
                  <span className="bg-gradient-to-r from-[#00f0ff] via-[#d9048a] to-[#ff007f] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,240,255,0.3)]">
                    Developer Inspiration
                  </span>
                </h1>

                <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                  Curated wisdom, clean engineering philosophies, and timeless motivation for software developers and systems architects. Built as an end-to-end college DevOps benchmark.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <a
                    href="#explorer"
                    className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00f0ff] to-[#00b4d8] text-[#060814] shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.65)] hover:-translate-y-0.5 transition"
                  >
                    🔍 Explore Quotes
                  </a>
                  <button
                    onClick={() => {
                      loadRandomFeaturedQuote();
                      const feat = document.getElementById("featured");
                      if (feat) feat.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#ff007f] to-[#d9046c] text-white shadow-[0_0_20px_rgba(255,0,127,0.4)] hover:shadow-[0_0_30px_rgba(255,0,127,0.65)] hover:-translate-y-0.5 transition flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Get Inspired</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 2. Featured Quote Card */}
            <section id="featured" className="py-16 px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <span className="inline-block font-mono text-xs uppercase tracking-widest text-[#ff007f] px-3 py-1 rounded-full bg-[#ff007f]/10 border border-[#ff007f]/30 mb-2">
                    Spotlight
                  </span>
                  <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    Featured Inspiration
                  </h2>
                </div>

                <div className="relative rounded-2xl p-8 sm:p-10 bg-[#121830]/80 backdrop-blur-xl border border-[#00f0ff]/30 shadow-[0_0_35px_rgba(0,240,255,0.15)] transition hover:border-[#00f0ff]/50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">
                      {featuredQuote.category}
                    </span>
                    <span className="text-slate-500 font-mono text-xs">#{featuredQuote.id}</span>
                  </div>

                  <div className="text-5xl text-[#ff007f]/60 font-serif leading-none mb-2 select-none">“</div>
                  <blockquote className="text-xl sm:text-2xl font-semibold italic text-slate-100 mb-6 leading-relaxed">
                    "{featuredQuote.text}"
                  </blockquote>
                  <div className="text-[#00f0ff] font-bold text-lg mb-8 flex items-center gap-2">
                    <span className="text-[#ff007f]">—</span> {featuredQuote.author}
                  </div>

                  {/* Actions */}
                  <div className="pt-6 border-t border-white/10 flex flex-wrap gap-2.5">
                    <button
                      onClick={loadRandomFeaturedQuote}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-[#00f0ff] text-[#060814] shadow-[0_0_12px_rgba(0,240,255,0.4)] hover:brightness-110 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> New Quote
                    </button>
                    <button
                      onClick={() => handleCopy(featuredQuote.text, "Quote text copied!")}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#00f0ff]" /> Copy Text
                    </button>
                    <button
                      onClick={() => handleCopy(`"${featuredQuote.text}" — ${featuredQuote.author}`, "Quote with author copied!")}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#00f0ff]" /> Copy with Author
                    </button>
                    <button
                      onClick={() => toggleFavoriteQuote(featuredQuote)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                        isFavorited(featuredQuote.id)
                          ? "bg-[#ff007f] text-white shadow-[0_0_12px_rgba(255,0,127,0.4)]"
                          : "bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10"
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5" />
                      {isFavorited(featuredQuote.id) ? "Saved" : "Save"}
                    </button>
                    <button
                      onClick={() => handleShare(featuredQuote)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#ff007f]" /> Share
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Quote of the Day */}
            <section id="daily" className="py-16 px-4 bg-[#0a0d1d]/60">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <span className="inline-block font-mono text-xs uppercase tracking-widest text-[#00f0ff] px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 mb-2">
                    Everyday Ritual
                  </span>
                  <h2 className="text-3xl font-extrabold tracking-tight text-white">
                    Quote of the Day
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Deterministic calculation. Every visitor across the world sees this exact quote today.
                  </p>
                </div>

                <div className="relative rounded-2xl p-8 sm:p-10 bg-[#16122a]/85 backdrop-blur-xl border border-[#ff007f]/30 shadow-[0_0_35px_rgba(255,0,127,0.15)]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-[#ff007f]/15 text-[#ff007f] border border-[#ff007f]/30">
                      {dailyQuote.category}
                    </span>
                    <span className="font-mono text-xs text-[#ff007f] bg-[#ff007f]/10 px-2.5 py-1 rounded-md border border-[#ff007f]/20">
                      {new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <div className="text-5xl text-[#00f0ff]/60 font-serif leading-none mb-2 select-none">“</div>
                  <blockquote className="text-xl sm:text-2xl font-semibold italic text-slate-100 mb-6 leading-relaxed">
                    "{dailyQuote.text}"
                  </blockquote>
                  <div className="text-[#ff007f] font-bold text-lg mb-8 flex items-center gap-2">
                    <span className="text-[#00f0ff]">—</span> {dailyQuote.author}
                  </div>

                  <div className="pt-6 border-t border-white/10 flex flex-wrap gap-2.5">
                    <button
                      onClick={() => handleCopy(`"${dailyQuote.text}" — ${dailyQuote.author}`, "Quote of the day copied!")}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-[#ff007f] text-white shadow-[0_0_12px_rgba(255,0,127,0.4)] hover:brightness-110 transition"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy Daily Quote
                    </button>
                    <button
                      onClick={() => toggleFavoriteQuote(dailyQuote)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                        isFavorited(dailyQuote.id)
                          ? "bg-[#00f0ff] text-[#060814] font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                          : "bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10"
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5" />
                      {isFavorited(dailyQuote.id) ? "Saved" : "Save to Favorites"}
                    </button>
                    <button
                      onClick={() => handleShare(dailyQuote)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#00f0ff]" /> Share
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Quote Explorer */}
            <section id="explorer" className="py-20 px-4">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                  <span className="inline-block font-mono text-xs uppercase tracking-widest text-[#00f0ff] px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 mb-2">
                    Curated Library
                  </span>
                  <h2 className="text-3xl font-extrabold tracking-tight text-white">
                    Quote Explorer
                  </h2>
                  <p className="text-slate-400 text-sm max-w-lg mx-auto mt-1">
                    Search and filter through 26 timeless developer philosophies, learning insights, and discipline drivers.
                  </p>
                </div>

                {/* Filter and Search Bar */}
                <div className="max-w-3xl mx-auto mb-10 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by keywords, author (e.g. Linus, Dijkstra), or topic..."
                      className="w-full bg-[#0e1224]/90 border border-white/15 focus:border-[#00f0ff] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/30 transition"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {["All", "Programming", "Learning", "Creativity", "Discipline", "Motivation"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                          selectedCategory === cat
                            ? "bg-[#00f0ff] text-[#060814] shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                            : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="text-center text-xs font-mono text-slate-500">
                    Showing {filteredQuotes.length} of {QUOTES_DATA.length} quotes
                  </div>
                </div>

                {/* Quotes Grid */}
                {filteredQuotes.length === 0 ? (
                  <div className="max-w-md mx-auto text-center py-16 px-4 bg-[#0e1224]/40 rounded-2xl border border-dashed border-white/15">
                    <Search className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <h3 className="font-bold text-white mb-1">No matching quotes found</h3>
                    <p className="text-slate-400 text-xs mb-4">Try clearing your search terms or choosing another category filter.</p>
                    <button
                      onClick={() => {
                        setSelectedCategory("All");
                        setSearchQuery("");
                      }}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#00f0ff] text-[#060814]"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredQuotes.map((quote) => {
                      const saved = isFavorited(quote.id);
                      return (
                        <div
                          key={quote.id}
                          className="flex flex-col justify-between rounded-xl p-6 bg-[#121830]/70 backdrop-blur-md border border-white/10 hover:border-[#00f0ff]/40 transition hover:-translate-y-1 shadow-lg"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">
                                {quote.category}
                              </span>
                              <span className="font-mono text-xs text-slate-500">#{quote.id}</span>
                            </div>
                            <p className="text-slate-200 text-sm font-medium leading-relaxed mb-4">
                              "{quote.text}"
                            </p>
                          </div>

                          <div>
                            <div className="text-[#00f0ff] font-semibold text-xs mb-4">
                              — {quote.author}
                            </div>
                            <div className="pt-3 border-t border-white/5 flex items-center gap-1.5">
                              <button
                                onClick={() => handleCopy(`"${quote.text}" — ${quote.author}`, "Copied quote!")}
                                className="px-2.5 py-1.5 rounded text-xs bg-white/5 hover:bg-[#00f0ff]/15 hover:text-[#00f0ff] text-slate-300 transition flex items-center gap-1"
                                title="Copy"
                              >
                                <Copy className="w-3 h-3" /> Copy
                              </button>
                              <button
                                onClick={() => toggleFavoriteQuote(quote)}
                                className={`px-2.5 py-1.5 rounded text-xs transition flex items-center gap-1 ${
                                  saved
                                    ? "bg-[#ff007f]/20 text-[#ff007f] border border-[#ff007f]/40"
                                    : "bg-white/5 hover:bg-[#ff007f]/15 hover:text-[#ff007f] text-slate-300"
                                }`}
                                title={saved ? "Remove" : "Save"}
                              >
                                <Heart className="w-3 h-3" /> {saved ? "Saved" : "Save"}
                              </button>
                              <button
                                onClick={() => handleShare(quote)}
                                className="px-2.5 py-1.5 rounded text-xs bg-white/5 hover:bg-[#ff007f]/15 hover:text-[#ff007f] text-slate-300 transition flex items-center gap-1 ml-auto"
                                title="Share"
                              >
                                <Share2 className="w-3 h-3" /> Share
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* 5. Saved Favorites */}
            <section id="favorites" className="py-16 px-4 bg-[#0a0d1d]/60">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                  <span className="inline-block font-mono text-xs uppercase tracking-widest text-[#ff007f] px-3 py-1 rounded-full bg-[#ff007f]/10 border border-[#ff007f]/30 mb-2">
                    Local Storage
                  </span>
                  <h2 className="text-3xl font-extrabold tracking-tight text-white">
                    Your Saved Favorites ({favorites.length})
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Persisted in your browser's localStorage. Survives tab closes, reloads, and offline browsing.
                  </p>
                </div>

                {favorites.length === 0 ? (
                  <div className="max-w-md mx-auto text-center py-12 px-6 bg-[#0e1224]/50 rounded-2xl border border-dashed border-white/15">
                    <Heart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="font-bold text-white text-base mb-1">Your favorites board is empty</h3>
                    <p className="text-slate-400 text-xs mb-5 leading-relaxed">
                      Browse quotes above and click "Save" on any thought you'd like to revisit!
                    </p>
                    <a
                      href="#explorer"
                      className="inline-flex px-4 py-2 rounded-lg text-xs font-bold bg-[#00f0ff] text-[#060814]"
                    >
                      Browse Quote Explorer
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((quote) => (
                      <div
                        key={quote.id}
                        className="flex flex-col justify-between rounded-xl p-6 bg-[#16122a]/70 backdrop-blur-md border border-[#ff007f]/30 shadow-lg"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-[#ff007f]/15 text-[#ff007f] border border-[#ff007f]/30">
                              {quote.category}
                            </span>
                            <span className="font-mono text-xs text-slate-500">#{quote.id}</span>
                          </div>
                          <p className="text-slate-200 text-sm font-medium leading-relaxed mb-4">
                            "{quote.text}"
                          </p>
                        </div>

                        <div>
                          <div className="text-[#ff007f] font-semibold text-xs mb-4">
                            — {quote.author}
                          </div>
                          <div className="pt-3 border-t border-white/5 flex items-center gap-1.5">
                            <button
                              onClick={() => handleCopy(`"${quote.text}" — ${quote.author}`, "Copied quote!")}
                              className="px-2.5 py-1.5 rounded text-xs bg-white/5 hover:bg-[#00f0ff]/15 hover:text-[#00f0ff] text-slate-300 transition flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" /> Copy
                            </button>
                            <button
                              onClick={() => toggleFavoriteQuote(quote)}
                              className="px-2.5 py-1.5 rounded text-xs bg-[#ff007f]/20 hover:bg-[#ff007f]/30 text-[#ff007f] border border-[#ff007f]/40 transition flex items-center gap-1"
                            >
                              <Heart className="w-3 h-3 fill-current" /> Remove
                            </button>
                            <button
                              onClick={() => handleShare(quote)}
                              className="px-2.5 py-1.5 rounded text-xs bg-white/5 hover:bg-[#ff007f]/15 hover:text-[#ff007f] text-slate-300 transition flex items-center gap-1 ml-auto"
                            >
                              <Share2 className="w-3 h-3" /> Share
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 6. About DevOps Section */}
            <section id="about" className="py-20 px-4">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                  <span className="inline-block font-mono text-xs uppercase tracking-widest text-[#00f0ff] px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 mb-2">
                    Architecture & Rationale
                  </span>
                  <h2 className="text-3xl font-extrabold tracking-tight text-white">
                    About CodeQuote & The DevOps Workflow
                  </h2>
                </div>

                <div className="rounded-2xl p-8 bg-[#0e1224]/80 border border-[#00f0ff]/25 backdrop-blur-md">
                  <p className="text-slate-300 leading-relaxed text-sm sm:text-base mb-8">
                    <strong>CodeQuote</strong> was built with zero runtime dependencies (no heavyweight React/Vue runtime, no database, no third-party APIs) strictly to demonstrate the purity of a cloud-native DevOps lifecycle. Because the application is lightweight, the entire pipeline from code push to Kubernetes deployment takes under 60 seconds with zero-downtime rolling updates.
                  </p>

                  {/* Visual Pipeline Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8 bg-[#060814]/80 p-4 rounded-xl border border-white/10">
                    {[
                      { step: "1. Git", desc: "Local commits & history", color: "text-[#00f0ff]" },
                      { step: "2. GitHub", desc: "Remote push & webhooks", color: "text-[#ff007f]" },
                      { step: "3. Shell Tests", desc: "tests/check.sh pass", color: "text-[#00f0ff]" },
                      { step: "4. Docker", desc: "Nginx alpine <25MB", color: "text-[#ff007f]" },
                      { step: "5. Jenkins", desc: "7-stage automation", color: "text-[#00f0ff]" },
                      { step: "6. Kubernetes", desc: "2 pods, RollingUpdate", color: "text-[#ff007f]" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center text-center p-2 rounded-lg bg-white/5">
                        <span className={`font-mono font-bold text-xs ${item.color}`}>{item.step}</span>
                        <span className="text-[11px] text-slate-400 mt-0.5">{item.desc}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 font-bold text-sm text-[#00f0ff] mb-1">
                        <ShieldCheck className="w-4 h-4" /> Zero Secret Leakage
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Strict <code>.dockerignore</code> rules and Jenkins credentials binding guarantee that tokens, passwords, and kubeconfig files never enter Git or image layers.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 font-bold text-sm text-[#ff007f] mb-1">
                        <Activity className="w-4 h-4" /> Kubernetes Health Probes
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        A dedicated <code>/health.html</code> endpoint returning "OK" serves as the single source of truth for Readiness and Liveness probes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: JENKINS PIPELINE SIMULATOR */}
        {/* ========================================================================= */}
        {activeTab === "pipeline" && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-[#ff007f] bg-[#ff007f]/10 border border-[#ff007f]/30 mb-2">
                  <Layers className="w-3.5 h-3.5" /> Declarative Jenkinsfile Runner
                </div>
                <h1 className="text-3xl font-extrabold text-white">CI/CD Pipeline Simulator</h1>
                <p className="text-slate-400 text-sm mt-1">
                  Trigger an end-to-end automated build (# {buildNumber}) with real-time stage execution and container smoke tests.
                </p>
              </div>

              <button
                onClick={runJenkinsPipeline}
                disabled={pipelineRunning}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
                  pipelineRunning
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#ff007f] to-[#d9046c] text-white shadow-[0_0_20px_rgba(255,0,127,0.4)] hover:shadow-[0_0_25px_rgba(255,0,127,0.6)]"
                }`}
              >
                <Play className={`w-4 h-4 ${pipelineRunning ? "animate-spin" : ""}`} />
                {pipelineRunning ? "Pipeline Running..." : "Trigger Build Pipeline"}
              </button>
            </div>

            {/* Stages Visual Stepper */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
              {[
                { name: "Checkout", tool: "Git SCM" },
                { name: "Test", tool: "tests/check.sh" },
                { name: "Build Image", tool: "Nginx Alpine" },
                { name: "Smoke Test", tool: "Port 8088 /health" },
                { name: "Push Registry", tool: "Docker Hub" },
                { name: "Deploy K8s", tool: "kubectl apply" },
                { name: "Verify", tool: "Rollout status" }
              ].map((stage, idx) => {
                const isPassed = currentStageIndex > idx || (!pipelineRunning && currentStageIndex === 6);
                const isCurrent = pipelineRunning && currentStageIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`rounded-xl p-3 border text-center transition ${
                      isCurrent
                        ? "bg-[#ff007f]/20 border-[#ff007f] shadow-[0_0_15px_rgba(255,0,127,0.3)] animate-pulse"
                        : isPassed
                        ? "bg-[#00f0ff]/10 border-[#00f0ff]/40 text-[#00f0ff]"
                        : "bg-[#0e1224] border-white/10 text-slate-500"
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1.5">
                      {isPassed ? (
                        <CheckCircle2 className="w-5 h-5 text-[#00f0ff]" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-5 h-5 text-[#ff007f] animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center text-[10px] font-mono">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-xs truncate text-white">{stage.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{stage.tool}</div>
                  </div>
                );
              })}
            </div>

            {/* Terminal Console View */}
            <div className="rounded-2xl bg-[#090b16] border border-white/15 overflow-hidden shadow-2xl">
              <div className="bg-[#12162a] px-4 py-2.5 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="font-mono text-xs text-slate-400 ml-2">
                    jenkins@agent-node:~# build-console.log (Build #{buildNumber})
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(pipelineLogs.join("\n"), "Console logs copied!")}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                >
                  <Copy className="w-3 h-3" /> Copy Logs
                </button>
              </div>

              <div className="p-4 font-mono text-xs text-slate-300 h-96 overflow-y-auto space-y-1">
                {pipelineLogs.length === 0 ? (
                  <div className="text-slate-500 italic py-8 text-center">
                    Click "Trigger Build Pipeline" above to run the 7-stage automated CI/CD pipeline and stream real-time logs.
                  </div>
                ) : (
                  pipelineLogs.map((log, i) => {
                    const isPass = log.includes("[PASS]") || log.includes("SUCCESS");
                    const isStage = log.includes("[Stage:");
                    return (
                      <div
                        key={i}
                        className={`leading-relaxed ${
                          isPass
                            ? "text-[#00f0ff] font-semibold"
                            : isStage
                            ? "text-[#ff007f] font-bold mt-2"
                            : "text-slate-300"
                        }`}
                      >
                        {log}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 3: KUBERNETES CLUSTER VISUALIZER */}
        {/* ========================================================================= */}
        {activeTab === "k8s" && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-[#00f0ff] bg-[#00f0ff]/10 border border-[#00f0ff]/30 mb-2">
                  <Cpu className="w-3.5 h-3.5" /> Kubernetes Orchestration
                </div>
                <h1 className="text-3xl font-extrabold text-white">Kubernetes Pod & Service Visualizer</h1>
                <p className="text-slate-400 text-sm mt-1">
                  Inspect the 2 pod replicas, Service routing, readiness/liveness probes, and trigger simulated node failures.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => simulatePodCrash(0)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40 transition flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5" /> Simulate Pod Crash
                </button>
                <button
                  onClick={runJenkinsPipeline}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00f0ff] text-[#060814] shadow-[0_0_15px_rgba(0,240,255,0.4)] transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Trigger RollingUpdate
                </button>
              </div>
            </div>

            {/* Service & Cluster Topology Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="rounded-2xl p-6 bg-[#0e1224] border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs text-[#00f0ff] font-bold">Service (NodePort)</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 font-mono">codequote-service</h3>
                  <div className="space-y-1.5 text-xs font-mono text-slate-400">
                    <div>Type: <span className="text-white">NodePort</span></div>
                    <div>Port: <span className="text-[#00f0ff]">80:30080/TCP</span></div>
                    <div>Selector: <span className="text-[#ff007f]">app=codequote</span></div>
                    <div>Cluster-IP: <span className="text-slate-300">10.96.142.88</span></div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-slate-500">
                  Routes external web traffic equally across all healthy ready pods.
                </div>
              </div>

              <div className="lg:col-span-2 rounded-2xl p-6 bg-[#0e1224] border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs text-[#ff007f] font-bold">Deployment & ReplicaSet</span>
                  <span className="text-xs font-mono text-slate-400">Replicas: 2 / 2 Ready</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-mono">codequote-deployment</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="text-slate-500 text-[10px]">STRATEGY</div>
                    <div className="text-white font-bold mt-0.5">RollingUpdate</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="text-slate-500 text-[10px]">MAX SURGE</div>
                    <div className="text-[#00f0ff] font-bold mt-0.5">+1 Pod</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="text-slate-500 text-[10px]">MAX UNAVAIL</div>
                    <div className="text-emerald-400 font-bold mt-0.5">0 (Zero Drop)</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="text-slate-500 text-[10px]">HEALTH PROBE</div>
                    <div className="text-[#ff007f] font-bold mt-0.5">/health.html</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pods Grid */}
            <div className="mb-8">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Box className="w-4 h-4 text-[#00f0ff]" /> Active Pod Replicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pods.map((pod, idx) => (
                  <div
                    key={pod.id}
                    className={`rounded-2xl p-6 border transition-all ${
                      pod.healthy
                        ? "bg-[#121830] border-[#00f0ff]/30 shadow-[0_0_20px_rgba(0,240,255,0.1)]"
                        : "bg-red-950/40 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${pod.healthy ? "bg-emerald-400" : "bg-red-500"}`} />
                        <span className="font-mono text-xs font-bold text-white truncate max-w-[200px]">{pod.id}</span>
                      </div>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/10 text-slate-300">
                        {pod.version}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 my-4 text-xs font-mono">
                      <div className="p-2 rounded bg-black/40">
                        <span className="text-slate-500 text-[10px]">STATUS</span>
                        <div className={`font-bold mt-0.5 ${pod.healthy ? "text-emerald-400" : "text-red-400"}`}>
                          {pod.status}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-black/40">
                        <span className="text-slate-500 text-[10px]">READY</span>
                        <div className="text-white font-bold mt-0.5">{pod.ready}</div>
                      </div>
                      <div className="p-2 rounded bg-black/40">
                        <span className="text-slate-500 text-[10px]">RESTARTS</span>
                        <div className="text-white font-bold mt-0.5">{pod.restarts}</div>
                      </div>
                    </div>

                    {/* Probes Status */}
                    <div className="space-y-1.5 text-xs font-mono pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Readiness Probe (/health.html):</span>
                        <span className={pod.healthy ? "text-[#00f0ff]" : "text-red-400"}>
                          {pod.healthy ? "HTTP 200 OK (Traffic Allowed)" : "Failed"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Liveness Probe (/health.html):</span>
                        <span className={pod.healthy ? "text-emerald-400" : "text-red-400"}>
                          {pod.healthy ? "Alive (Passing)" : "Failed"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                      <button
                        onClick={() => simulatePodCrash(idx)}
                        disabled={!pod.healthy}
                        className="text-xs text-red-400 hover:text-red-300 font-mono disabled:opacity-50"
                      >
                        [Simulate Failure]
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kubernetes Events Feed */}
            <div className="rounded-2xl bg-[#090b16] border border-white/15 p-4">
              <div className="font-mono text-xs font-bold text-slate-400 mb-2 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-[#00f0ff]" /> Recent Cluster Events (`kubectl get events`)
              </div>
              <div className="font-mono text-xs text-slate-300 space-y-1 max-h-40 overflow-y-auto">
                {k8sEventLog.map((ev, i) => (
                  <div key={i} className="text-slate-400">
                    {ev}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 4: MANIFESTS & CODE EXPLORER */}
        {/* ========================================================================= */}
        {activeTab === "files" && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-[#00f0ff] bg-[#00f0ff]/10 border border-[#00f0ff]/30 mb-2">
                <FileText className="w-3.5 h-3.5" /> Project Artifacts & Configurations
              </div>
              <h1 className="text-3xl font-extrabold text-white">Manifests & Code Explorer</h1>
              <p className="text-slate-400 text-sm mt-1">
                Every file required for the college submission. Click to inspect, view explanations, and one-click copy.
              </p>
            </div>

            {/* File Pill Switcher */}
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.keys(MANIFESTS).map((fileName) => (
                <button
                  key={fileName}
                  onClick={() => {
                    setSelectedFileName(fileName);
                    setCopiedFile(false);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                    selectedFileName === fileName
                      ? "bg-[#00f0ff] text-[#060814] shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                      : "bg-[#0e1224] text-slate-400 hover:text-white border border-white/10"
                  }`}
                >
                  {fileName}
                </button>
              ))}
            </div>

            {/* Code Viewer */}
            <div className="rounded-2xl bg-[#090b16] border border-white/15 overflow-hidden shadow-2xl">
              <div className="bg-[#12162a] px-5 py-3 flex items-center justify-between border-b border-white/10">
                <div>
                  <div className="font-mono text-sm font-bold text-white">{selectedFileName}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{MANIFESTS[selectedFileName]?.desc}</div>
                </div>

                <button
                  onClick={() => {
                    handleCopy(MANIFESTS[selectedFileName]?.code || "", `${selectedFileName} copied!`);
                    setCopiedFile(true);
                    setTimeout(() => setCopiedFile(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition"
                >
                  {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile ? "Copied" : "Copy Content"}</span>
                </button>
              </div>

              <pre className="p-6 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-[550px]">
                <code>{MANIFESTS[selectedFileName]?.code}</code>
              </pre>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 5: COLLEGE VIVA VOCE PREP & FLASHCARDS */}
        {/* ========================================================================= */}
        {activeTab === "viva" && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-[#ff007f] bg-[#ff007f]/10 border border-[#ff007f]/30 mb-2">
                <Award className="w-3.5 h-3.5" /> High-Score Defense Guide
              </div>
              <h1 className="text-3xl font-extrabold text-white">College Viva Voce Flashcards</h1>
              <p className="text-slate-400 text-sm mt-1">
                Exam questions asked by professors and external evaluators. Learn the exact technical keywords to score full marks.
              </p>
            </div>

            {/* Filter by phase */}
            <div className="flex flex-wrap gap-2 mb-8">
              {["All", "Git & GitHub", "Automated Testing", "Docker & Nginx", "Docker Hub", "Jenkins CI/CD", "Kubernetes"].map((p) => (
                <button
                  key={p}
                  onClick={() => setVivaFilter(p)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                    vivaFilter === p
                      ? "bg-[#ff007f] text-white shadow-[0_0_12px_rgba(255,0,127,0.4)]"
                      : "bg-[#0e1224] text-slate-400 hover:text-white border border-white/10"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Flashcards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {VIVA_QUESTIONS.filter((q) => vivaFilter === "All" || q.phase === vivaFilter).map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-6 bg-[#0e1224] border border-white/10 hover:border-[#ff007f]/40 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#ff007f]/10 text-[#ff007f] border border-[#ff007f]/30">
                        {item.phase}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-3">
                      Q: {item.question}
                    </h3>

                    <p className="text-sm text-slate-300 leading-relaxed mb-4">
                      <strong className="text-[#00f0ff]">Model Answer: </strong>
                      {item.answer}
                    </p>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono text-slate-400 mb-1.5 font-bold uppercase tracking-wider">
                      Key Words to Say to Examiner:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.keywords.map((kw, kIdx) => (
                        <span
                          key={kIdx}
                          className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 text-slate-300 border border-white/10"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Global Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl backdrop-blur-xl border text-sm font-medium shadow-2xl flex items-center gap-2.5 transition-all transform animate-in slide-in-from-right-10 ${
              toast.type === "pink"
                ? "bg-[#16122a]/95 border-[#ff007f] text-white shadow-[0_0_20px_rgba(255,0,127,0.35)]"
                : toast.type === "error"
                ? "bg-red-950/95 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.35)]"
                : "bg-[#0e1224]/95 border-[#00f0ff] text-white shadow-[0_0_20px_rgba(0,240,255,0.35)]"
            }`}
          >
            <span>{toast.type === "error" ? "⚠️" : toast.type === "pink" ? "💖" : "✨"}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#060814] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; {new Date().getFullYear()} <strong>CodeQuote</strong>. Built for developers & DevOps enthusiasts.
          </div>
          <div className="font-mono text-[#00f0ff]/80">
            Git • Bash Tests • Docker • Docker Hub • Jenkins • Kubernetes
          </div>
        </div>
      </footer>
    </div>
  );
}
