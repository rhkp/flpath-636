# cluster-swfs

The cluster-swfs backend plugin gets the workflow instances running on a given data index instance e.g. deployed on a Kubernetes cluster or otherwise, by querying data index.

## Prerequisites

- A valid running data index service accessible via data index graphql interface such as `http://<server:port>/graphql`

- Be sure to set the environment variable `DATA_INDEX_URL` in a terminal as follows e.g.

```shell
export DATA_INDEX_URL=http://<server:port>/graphql/
```

## Option 1 - Run the plugin from root directory

- Navigate to `backstage-showcase` directory.

```shell
cd <path to>/backstage-showcase
```

- Execute the backend plugins with this command.

```shell
yarn start-backend
```

- Test the plugin to see if it returns deployed workflows.

```shell
curl localhost:7007/api/cluster-swf-backend/swfs | jq .
```

- You should be able to see a response similar to this.

```json
{
  "result": [
    {
      "id": "event-timeout",
      "name": "workflow",
      "version": "0.0.1",
      "type": null,
      "endpoint": "http://172.30.206.161:80/event-timeout",
      "serviceUrl": "http://172.30.206.161:80",
      "__typename": "ProcessDefinition"
    }
  ],
  "message": "success"
}
```

## Option 2 - Run the plugin from the plugin directory

- Navigate to `backstage-showcase` directory.

```shell
cd <path to>/backstage-showcase/plugins/cluster-swfs-backend
```

- Execute the backend plugins with this command.

```shell
yarn start
```

- Test the plugin to see if it returns deployed workflows.

```shell
curl localhost:7007/cluster-swfs/swfs | jq .
```

- You should be able to see a response similar to this.

```json
{
  "result": [
    {
      "id": "event-timeout",
      "name": "workflow",
      "version": "0.0.1",
      "type": null,
      "endpoint": "http://172.30.206.161:80/event-timeout",
      "serviceUrl": "http://172.30.206.161:80",
      "__typename": "ProcessDefinition"
    }
  ],
  "message": "success"
}
```

### Running the tests

- Use the following command

```shell
yarn test
```
