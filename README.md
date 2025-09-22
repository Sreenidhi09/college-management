Q1 — SRS for Hospital Management System (10M)

Abstract (4M)
Hospital Management System (HMS) is a web-based application for managing patient records, appointments, staff, billing, and hospital operations. It stores patient demographics, medical history, diagnoses, lab results, doctor schedules, prescriptions and billing records in a secure database. HMS provides role-based access (admin, doctor, nurse, receptionist, pharmacist), appointment booking, electronic medical records, reporting, and audit trails. The system encrypts sensitive data and supports backup, restore and integration with lab devices and external insurance/ID providers.

Functional requirements (2M)

Patient management: create/read/update/delete (CRUD) patient records, medical history, contact info.

Appointment management: schedule, reschedule, cancel; view doctor availability.

Staff management: CRUD staff (doctors/nurses), assign roles and schedules.

EMR: Doctors can add diagnoses, prescriptions, lab orders.

Billing: generate bills, calculate insurance coverage, print receipts.

Authentication & RBAC: login, password reset, role-based pages.

Reporting: daily patient list, revenue, appointment summary.

Non-functional requirements (2M)

Security: TLS for web, encryption at rest for PHI, audit log for data changes.

Performance: pages should load <2s under normal load (e.g., 100 concurrent users).

Availability: 99.5% uptime, daily backups.

Scalability: designed for horizontal scaling of web tier and DB sharding if needed.

Maintainability: modular code, RESTful APIs, automated tests and CI/CD.

Identification of users (2M)

Administrators (full access)

Doctors (view/update patient records, write prescriptions)

Nurses (view records, update vitals)

Receptionists (appointments, patient check-in, billing initiation)

Pharmacists (view prescriptions, dispense)

Lab technicians (view test orders, upload results)

External systems (insurance gateway, lab instruments) — service accounts/APIs

Q2 — Maven Java Application (30M)

I’ll treat each sub-question in order and provide the commands / snippets.

Repository: https://github.com/Kumbhambhargavi75/HospitalMgmtSystem
(You said to download it — use git clone.)

1) Download repo and show list of files — 3M

Commands:

git clone https://github.com/Kumbhambhargavi75/HospitalMgmtSystem.git
cd HospitalMgmtSystem
ls -la
# to list everything recursively:
find . -maxdepth 2 -print


This lists top-level files and directories (pom.xml, src, webapp, README etc.). (Run ls -la in your environment to see actual file names.)

2) mva CLEAN package unknown lifecycle phase error — 2M

Problem: The command mva CLEAN package is wrong (typo). Maven command must be mvn (not mva) and lifecycle phases are usually lowercase.
Correct command:

mvn clean package


If you typed mvn CLEAN package it usually still works because Maven is flexible about case, but mva is definitely wrong and will cause Unknown lifecycle phase or command not found.

3) Add dependency servlet-api 2.5 to project — 2M

Add this inside <dependencies> in pom.xml with scope provided (servlet API is supplied by the container like Tomcat):

<dependency>
  <groupId>javax.servlet</groupId>
  <artifactId>servlet-api</artifactId>
  <version>2.5</version>
  <scope>provided</scope>
</dependency>


(Artifact coordinates for 2.5 are available in Maven repos.) 
Maven Repository

4) Build fails with JDK 21 — why & fix in pom.xml — 2M

Why it fails: common causes:

Maven is running with a JRE instead of a JDK (no compiler available).

maven-compiler-plugin or <properties> don’t specify a matching Java release (or plugin is too old to recognize 21).
How to fix (in pom.xml):
Set the Java version properties and configure the compiler plugin to a modern version. Example:

<properties>
  <maven.compiler.source>21</maven.compiler.source>
  <maven.compiler.target>21</maven.compiler.target>
  <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>

<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-compiler-plugin</artifactId>
      <version>3.14.0</version> <!-- modern version -->
      <configuration>
        <release>21</release>
      </configuration>
    </plugin>
  </plugins>
</build>


Also make sure JAVA_HOME points at a JDK 21 and mvn -v shows Java 21. The compiler plugin page documents behavior. 
Apache Maven
+1

5) Dependency with wrong coordinates:
<dependency>
  <groupId>SE</groupId>
  <artifactId>junit</artifactId>
  <version>4.6.0</version>
</dependency>


What will Maven do?
Maven will try to resolve this from configured repos. Since groupId=SE is almost certainly invalid, resolution will fail with Could not find artifact SE:junit:jar:4.6.0 and the build will fail.

How to fix: use correct coordinates for JUnit. Example for JUnit 4:

<dependency>
  <groupId>junit</groupId>
  <artifactId>junit</artifactId>
  <version>4.13.2</version>
  <scope>test</scope>
</dependency>


Or for JUnit 5:

<dependency>
  <groupId>org.junit.jupiter</groupId>
  <artifactId>junit-jupiter</artifactId>
  <version>5.10.0</version>
  <scope>test</scope>
</dependency>

6) WAR file name is hospitalmgmtsystem-0.0.1-SNAPSHOT.war — how to change — 3M

Change finalName in <build>:

<build>
  <finalName>HospitalMgmtSystem</finalName>
  ...
</build>


After mvn clean package the WAR will be target/HospitalMgmtSystem.war.

7) Add common dependency Java Servlet API 4.0.0-001 to pom and name it — 2M

Add this (again with provided scope):

<dependency>
  <groupId>javax.servlet</groupId>
  <artifactId>javax.servlet-api</artifactId>
  <version>4.0.0</version>
  <scope>provided</scope>
</dependency>


This is the modern servlet API artifact for servlet 4.0.0. 
Maven Central
+1

8) Developer removes the <dependencies> section completely — Will Maven still build? Issues during testing — 2M

Maven will still build basic packaging if no compile-time dependencies are needed. But:

Any external libs (JUnit for tests, servlet API for compilation, DB drivers) will be missing causing compile/test failures.

Tests that depend on test-scoped dependencies will fail because test libs are gone.

The WAR may compile if code uses only JDK classes, but web code that needs servlet classes will fail to compile (unless the container supplies them at compile time — but best practice is to list them as provided).
Error you quoted (No compiler is provided ... running on a JRE rather than a JDK) indicates Maven was run with a JRE — fix by setting JAVA_HOME to JDK and using mvn -v to confirm.

9) Build finalName / context path issues — 2M

If final name is set, http://localhost:8080/<finalName>/... works; else container names WAR filename as context. Use <finalName> in pom.xml (see #6) or configure Tomcat context. Example:

<build>
  <finalName>HospitalMgmtSystem</finalName>
</build>

10) Project meant to deploy to Tomcat but packaging incorrectly set — how to solve — 1M

Ensure pom.xml has:

<packaging>war</packaging>


If packaging is jar, change to war. Also ensure src/main/webapp structure exists.

11) Purpose of <url> tag and whether Maven accepts incorrect URL string — 3M

<url> in <project> is informational metadata indicating project homepage. Maven accepts a string but it should be a valid URL (e.g., https://maven.apache.org). If malformed, it won't usually break the build (it’s not validated strictly), but keep it well-formed. The correct purpose is project metadata.

12) Push corrected POM to your GitHub — 3M

Commands:

git checkout -b fix/pom
# edit pom.xml (apply changes shown below)
git add pom.xml
git commit -m "Fix pom: set java 21, add servlet deps, set finalName, set packaging war"
git push -u origin fix/pom

Full example pom.xml (complete) — paste into repo / replace existing

This pom shows: war packaging, servlet-api 2.5 (and servlet-api 4.0.0 entry as requested), maven-compiler-plugin configured for Java 21, finalName set.

<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.kmit</groupId>
  <artifactId>hospitalmgmtsystem</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <packaging>war</packaging>
  <name>HospitalMgmtSystem</name>
  <url>https://github.com/Kumbhambhargavi75/HospitalMgmtSystem</url>

  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.source>21</maven.compiler.source>
    <maven.compiler.target>21</maven.compiler.target>
    <maven.compiler.release>21</maven.compiler.release>
  </properties>

  <dependencies>
    <!-- Servlet API 2.5 (provided by servlet container) -->
    <dependency>
      <groupId>javax.servlet</groupId>
      <artifactId>servlet-api</artifactId>
      <version>2.5</version>
      <scope>provided</scope>
    </dependency>

    <!-- Modern Servlet API 4.0.0 (if you need features from servlet 4) -->
    <dependency>
      <groupId>javax.servlet</groupId>
      <artifactId>javax.servlet-api</artifactId>
      <version>4.0.0</version>
      <scope>provided</scope>
    </dependency>

    <!-- Example: JUnit for tests -->
    <dependency>
      <groupId>junit</groupId>
      <artifactId>junit</artifactId>
      <version>4.13.2</version>
      <scope>test</scope>
    </dependency>

    <!-- Add DB drivers, logging, frameworks here as needed -->
  </dependencies>

  <build>
    <finalName>HospitalMgmtSystem</finalName>

    <plugins>
      <!-- Compiler plugin configured for Java 21 -->
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.14.0</version>
        <configuration>
          <release>21</release>
        </configuration>
      </plugin>

      <!-- Optional: maven-war-plugin (default handles packaging) -->
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-war-plugin</artifactId>
        <version>3.3.2</version>
        <configuration>
          <failOnMissingWebXml>false</failOnMissingWebXml>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>


Sources on servlet artifacts and compiler plugin: 
Maven Repository
+2
Maven Central
+2

Q3 — Git & GitHub Integration (30M)

I’ll answer each sub-question with exact commands.

Discard un-staged local changes (you haven’t staged them yet) — 2M

# restore tracked files to last commit
git checkout -- <file1> <file2>
# or all files:
git checkout -- .


You made a commit but typed the wrong commit message and haven’t pushed yet — 2M

git commit --amend -m "Correct commit message"
# If already pushed (not the case here), you'd instead use force push (careful):
# git push --force-with-lease


View commit history of current branch (compact) — 2M

git log --oneline --graph --decorate --all


Switch from main to feature branch feature/xyz (create if not exists) — 2M

# if feature branch exists remotely:
git checkout feature/xyz      # or
git switch feature/xyz

# to create and switch:
git checkout -b feature/xyz
# or
git switch -c feature/xyz


You made local commits and want to upload them to remote — 2M

git push origin <current-branch>
# or with upstream set first time:
git push -u origin <current-branch>


See all branches local and remote — 2M

git branch              # local
git branch -r           # remote only
git branch -a           # all


Create branch Suggestions and merge into parent branch — 3M

git checkout -b Suggestions
# work, commit changes:
git add .
git commit -m "Add suggestions"
# switch to parent branch
git checkout parent
git merge Suggestions
# push
git push origin parent


Pull latest changes and merge into current branch — 2M

git pull origin <branch-name>
# safer: fetch then merge/rebase
git fetch origin
git merge origin/<branch-name>
# or rebase
git rebase origin/<branch-name>


Set upstream (main branch) when pushing for first time — 2M

git push -u origin main


Push changes to a different remote — 2M

# add new remote
git remote add otherRemote https://github.com/yourUser/anotherRepo.git
# push branch to other remote
git push otherRemote <branch-name>
# or set push URL for origin:
git remote set-url --push origin git@github.com:yourUser/otherRepo.git


Local branch behind remote after git pull — update without losing local changes — 3M

# Recommended: stash local changes, pull, reapply
git stash
git pull --rebase origin <branch>
git stash pop

# Or: fetch and rebase
git fetch origin
git rebase origin/<branch>


Delete branch from remote — 2M

git push origin --delete <branch-name>
# or (older syntax)
git push origin :<branch-name>


Apply a patch file provided and checkout to your commits — 3M

# apply a patch created with git format-patch or git diff > my.patch
git apply my.patch            # applies patch but doesn't create commits
# to create commits as patch describes:
git am my.patch               # if patch was produced with git format-patch

Q4 — Docker containerization for Maven Application (20M) and Docker Compose (10M)

I’ll provide a Dockerfile to deploy the WAR on Tomcat, commands to build/run/manage images/containers, and a docker-compose.yaml with MongoDB.

Dockerfile (Tomcat + WAR)

Place this file in project root (next to target/).

# Use official Tomcat as base
FROM tomcat:9.0-jdk11-openjdk

# Remove default webapps to avoid auto-exploded ROOT if desired
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy the WAR produced by mvn package into webapps
# Make sure you built the WAR first (target/HospitalMgmtSystem.war)
COPY target/HospitalMgmtSystem.war /usr/local/tomcat/webapps/ROOT.war

EXPOSE 8080
# Tomcat default startup CMD is fine


This will deploy your app at the root context (/) inside Tomcat.

Docker CLI commands & answers to sub-questions

Build the Docker image with name hospital-mg:

docker build -t hospital-mg:latest .


List all Docker images on host:

docker images
# or
docker image ls


Run the container mapping container port 8080 to host port 9090 (you said host 9090):

docker run -d --name hospital-mg -p 9090:8080 hospital-mg:latest


Now open http://localhost:9090/ in browser.

Pull official Redis (or other) image and run it (example with Tomcat official too)
(e.g., pull tomcat)

docker pull tomcat:9.0
docker run -d --name tomcat-test -p 8081:8080 tomcat:9.0
# list running containers
docker ps


Then verify via browser http://localhost:8081/.

Tag and push image to Docker Hub (after login)

docker login
docker tag hospital-mg:latest yourdockerhubusername/hospital-mg:1.0
docker push yourdockerhubusername/hospital-mg:1.0


You forgot to expose port mapping and cannot access app — stop and run with mapping
Stop container then run with mapping:

docker stop hospital-mg
docker rm hospital-mg
docker run -d --name hospital-mg -p 9090:8080 yourdockerhubusername/hospital-mg:1.0


Container crashes immediately after startup — view logs

docker logs hospital-mg
# follow logs
docker logs -f hospital-mg


Enter running container interactively (open shell):

docker exec -it hospital-mg /bin/bash
# or if sh:
docker exec -it hospital-mg /bin/sh


Remove stopped containers (prune)

docker container prune
# or remove specific container:
docker rm <container-id-or-name>

Docker Compose (10M)

Create docker-compose.yml to run your app container (from Docker Hub or built local) + MongoDB (example).

version: "3.8"

services:
  app:
    image: yourdockerhubusername/hospital-mg:1.0  # or build: context: .
    ports:
      - "7079:8080"   # runs app on host port 7079 -> container 8080
    depends_on:
      - mongodb
    environment:
      - MONGO_HOST=mongodb
      - MONGO_PORT=27017

  mongodb:
    image: mongo:6.0
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secretpassword
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:


Commands to run compose:

docker-compose up -d
# to view logs
docker-compose logs -f
# stop and remove
docker-compose down

Short checklist of commands you’ll actually run (copy/paste)
# clone repo
git clone https://github.com/Kumbhambhargavi75/HospitalMgmtSystem.git
cd HospitalMgmtSystem

# edit pom.xml (replace with provided full pom or apply changes)
# Build with maven correctly:
mvn clean package

# build docker image (after mvn package produced target/HospitalMgmtSystem.war)
docker build -t hospital-mg:latest .

# run docker container mapping to 9090 host
docker run -d --name hospital-mg -p 9090:8080 hospital-mg:latest

# view running containers
docker ps

# push to Docker Hub (after tagging)
docker tag hospital-mg:latest yourdockerhubusername/hospital-mg:1.0
docker push yourdockerhubusername/hospital-mg:1.0
