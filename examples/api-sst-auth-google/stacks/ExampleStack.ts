import { StackContext, Api, Auth, ViteStaticSite, Table } from "sst/constructs";

export function ExampleStack({ stack }: StackContext) {
  // Create a database Table
  const table = new Table(stack, "users", {
    fields: {
      userId: "string",
    },
    primaryIndex: { partitionKey: "userId" },
  });

  // Create Api
  const api = new Api(stack, "api", {
    defaults: {
      function: {
        bind: [table],
      },
    },
    routes: {
      "GET /": "packages/functions/src/lambda.handler",
      "GET /session": "packages/functions/src/session.handler",
    },
  });

  // Create a React site
  const site = new ViteStaticSite(stack, "site", {
    path: "web",
    environment: {
      VITE_APP_API_URL: api.url,
    },
  });

  // Create Auth provider
  const auth = new Auth(stack, "auth", {
    authenticator: {
      handler: "packages/functions/src/auth.handler",
      bind: [site],
    },
  });
  auth.attach(stack, {
    api,
    prefix: "/auth",
  });

  // Show the API endpoint and other info in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
    SiteURL: site.url,
  });
}
