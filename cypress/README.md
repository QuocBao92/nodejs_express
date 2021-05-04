# E2E testing

This e2e testing stands for the middle scale integration testing.
Non-destructive testing

## Objective

- Run tests with real containers as possible.
- Focus on UI and features
- Test interaction and integration between each services.
  - Allocate all components which is existing outside of IKS as alternative containers with similar services.

NOT:

- Prepare real infrastructure as we designed.

## Components and workflow overview

components

| component             | base                     | description                                            |
| :-------------------- | :----------------------- | :----------------------------------------------------- |
| Kafka Broker (docker) | IBM Event Streams        | No TLS. No client credentials                          |
| Postgres              | Databases for PostgreSQL | No TLS.                                                |
| Ingress               |                          | Use cluster endpoint not CIS                           |
| IMO Components        | server                   | as is                                                  |
|                       | User Auth Service        | Use dummy service for user-auth-service to avoid login |

## Folders

| folder                                                       | description                             |
| :----------------------------------------------------------- | :-------------------------------------- |
| `cypress/docs/`                                              | documents related to e2e testing        |
| `cypress/fixtures/`                                          | fuxture data for snapshot testing       |
| `cypress/integration/`                                       | test cases                              |
| `cypress/integration/ci/snapshot_tests/__image_snapshots__/` | snapshots                               |
| `cypress/k8s-manifests/`                                     | k8s manifest files for prepare test env |
| `cypress/plugins/`                                           | configure cypress plugins               |
| `cypress/support/`                                           | configure cypress tests                 |
| `cypress/typings/`                                           | type definitions                        |

## Build container image for e2e

Use `Dockerfile-e2e` to build frontend container image for e2e testing.  
This container excludes login feature and uses dummy Bearer token to access backend services.

if you build locally,

```bash
$ docker build -t de.icr.io/bridge-x/web-app-e2e:<version-tag> -f ./Dockerfile-e2e .
```

## Deploy / Destroy

Use kubectl and kustomize functionality, we deploy all components to target IKS cluster.
Current manifest depends on `g-enterprise-dev` cluster.

If you want to deploy these to another cluster, you need to modify manifests in `cypress/k8s-manifests/vendor/`. And also you need to set imagePullSecret properly. [Setting up an image registry](https://cloud.ibm.com/docs/containers?topic=containers-registry)

`ingress-tcp.yaml` is not necessary for e2e runtime, it is used for managing postgres manually.

if you deploy from local,

```bash
# deploy
$ kubectl apply -k ./cypress/k8s-manifests

# run e2e
$ npm run e2e

# destroy
$ kubectl delete -k ./cypress/k8s-manifests
```

(note)  
Currently we are using `npm run e2e` to run only tests for asset list page.  
After test cases implemented for other components, use `npm run e2e-test` to run all tests.

### Change service versions

Change images section in `cypress/k8s-manifests/kustomization.yaml`.

`de.icr.io/bridge-x/web-app-e2e` is a web-app cotantainer image for e2e test. this version is overwritten in workflow. If you deploy manually, change version to target version.

### Change DDL and test data

sql files are stored in `cypress/k8s-manifests/postgres/files/initdb`.

The order of applying sql is controlled by file name.

00_xxx.sql : create database
1x_xxx.sql : create tables/views
5x_xxx.sql : insert test data
6x_xxx.sql : set val of serial

#### DDL

- Change "service versions" of `cypress/k8s-manifests/postgres/files/gen-ddl.sh` according to git tags/branch/hash
- Launch bash (wsl)
- Go into `cypress/k8s-manifests/postgres/files`
- execute `./gen-ddl.sh` then DDLs are generated in `cypress/k8s-manifests/postgres/files/initdb`.
- verify generated files `cypress/k8s-manifests/postgres/files/initdb`.
  - `xxxxx.sql`: not used at deploying
  - `xxxxx.sql.gz`: gzip for xxxxx.sql, used for deploying

(note) ConfigMap has size limit for data, so I compress sql file as gzip.

#### Test data

- Modify corresponding sql file
- Launch bash (wsl)
- Go into `cypress/k8s-manifests/postgres/files`
- execute `./mk-gzip.sh`

## Access Postgres from local

You can connect to postgres with;

- host: g-enterprise-dev.jp-tok.containers.appdomain.cloud
- port: 35432
- username: postgres
- password: postgres

Postgres port is exposed by `ingress-tcp.yaml`.
This manifest is really depending on IKS. If you use other kubernetes service, you need to change declarations.
