# AWS EC2 Deployment Guide for AdmissionAI

This guide provides step-by-step instructions for deploying the full-stack AdmissionAI application (Node.js backend and React frontend) onto a single AWS EC2 instance.

## Prerequisites

1.  **AWS Account**: An active AWS account.
2.  **Git Repository**: Your project code hosted on a service like GitHub.
3.  **Domain Name (Optional)**: A registered domain if you want a custom URL.

---

## Step 1: Database Setup (MongoDB Atlas)

It is highly recommended to use a managed database service like MongoDB Atlas for security and scalability.

1.  **Create a Free Cluster**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a new **M0 Free Tier** cluster.
2.  **Whitelist IP Address**: In your Atlas cluster's "Network Access" tab, add an IP address. For initial setup, you can add `0.0.0.0/0` (allows access from anywhere).
    - **Security Note**: Once your EC2 instance is running, replace `0.0.0.0/0` with your EC2 instance's public IP address for better security.
3.  **Get Connection String**: In the "Database" section, click "Connect" for your cluster, select "Drivers", and copy the connection string. It will look like `mongodb+srv://<user>:<password>@...`.

---

## Step 2: Launch and Configure an EC2 Instance

1.  **Log in to AWS Console**: Navigate to the EC2 service.
2.  **Launch Instance**: Click "Launch Instances".
3.  **Choose an AMI**: Select **Amazon Linux 2023 AMI**.
4.  **Instance Type**: Choose **t2.micro** (eligible for the AWS Free Tier).
5.  **Key Pair**: Create a new key pair. Give it a name (e.g., `admissionai-key`) and download the `.pem` file. **Store this file securely!**
6.  **Network Settings (Security Group)**: This is a critical step.
    - Click "Edit" next to Network settings.
    - Create a new security group.
    - Add the following **inbound rules**:
        - **Type:** `SSH`, **Source:** `My IP` (for secure access from your computer).
        - **Type:** `HTTP`, **Source:** `Anywhere` (`0.0.0.0/0`).
        - **Type:** `HTTPS`, **Source:** `Anywhere` (`0.0.0.0/0`).
7.  **Launch**: Click "Launch Instance".

---

## Step 3: Connect to and Prepare Your EC2 Instance

1.  **Connect via SSH**: Once your instance is running, select it in the EC2 console and click "Connect". Follow the instructions on the "SSH client" tab.

    ```bash
    # Make sure your .pem file is not publicly viewable
    chmod 400 your-key-name.pem

    # Connect to your instance (replace with your instance's public DNS)
    ssh -i "your-key-name.pem" ec2-user@your-public-dns.amazonaws.com
    ```

2.  **Install Dependencies**: Once connected, run the following commands to install Git, Node.js (using `nvm`), and a process manager (`pm2`).

    ```bash
    # Update the server
    sudo yum update -y

    # Install Git
    sudo yum install git -y

    # Install Node Version Manager (nvm)
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
    
    # Activate nvm for the current session
    . ~/.nvm/nvm.sh

    # Install a stable version of Node.js (e.g., v20)
    nvm install 20
    nvm use 20

    # Install PM2 globally to keep your server running
    npm install pm2 -g
    ```

---

## Step 4: Deploy Your Application

1.  **Clone Your Repository**:
    ```bash
    git clone https://your-git-repository-url.com/admissionai.git
    cd admissionai
    ```

2.  **Set Up Backend**:
    - Navigate to the backend directory: `cd backend`
    - Install dependencies: `npm install`
    - Create the `.env` file for your secrets:
        ```bash
        nano .env
        ```
    - Paste your environment variables into the editor. Use your real keys and connection strings.
        ```
        MONGO_URI="mongodb+srv://..."
        GOOGLE_CLIENT_ID="..."
        GOOGLE_CLIENT_SECRET="..."
        COOKIE_KEY="some-very-long-random-secret-string"
        GEMINI_API_KEY="..."
        EMAIL_HOST=smtp.gmail.com
        EMAIL_USER=kylerluo@gmail.com
        EMAIL_PASS=your-gmail-app-password
        EMAIL_PORT=587
        EMAIL_SECURE=false
        CONTACT_FORM_RECIPIENT=luolan2000@yahoo.com
        ```
    - Save the file by pressing `Ctrl+X`, then `Y`, then `Enter`.

3.  **Build the Frontend**:
    - Navigate to the frontend directory: `cd ../frontend`
    - Install dependencies: `npm install`
    - Build the static files: `npm run build`
    - This creates a `dist` folder inside `/frontend`. Your backend is already configured in `server.js` to serve these files.

---

## Step 5: Update Google OAuth Credentials

Your Google login will fail in production unless you update the redirect URI.

1.  Go to the Google Cloud Console - Credentials Page.
2.  Edit your OAuth 2.0 Client ID.
3.  Under **"Authorized redirect URIs"**, click **"+ ADD URI"** and add your production callback URL. Replace `your-ec2-public-ip` with your instance's actual IP address or domain name.
    - `http://your-ec2-public-ip/auth/google/callback`
    - (If you set up a domain): `http://www.myadmissionai.com/auth/google/callback`
4.  **Save** your changes.

---

## Step 6: Run the Application with PM2

`pm2` is a process manager that will keep your Node.js server running continuously.

1.  Navigate back to the backend directory: `cd ../backend`
2.  Start your server using `pm2`:
    ```bash
    pm2 start server.js --name "admissionai-app"
    ```
3.  **Save the process list** so it restarts automatically if the server reboots:
    ```bash
    pm2 save
    ```
4.  **Check the status** of your running application:
    ```bash
    pm2 list
    ```
    You can view live logs with `pm2 logs admissionai-app`.

---

### You're Live!

Your application should now be accessible by navigating to your EC2 instance's public IP address in a web browser. The Node.js server will handle all API requests and serve the React frontend to your users.