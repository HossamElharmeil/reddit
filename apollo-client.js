import { ApolloClient, InMemoryCache } from '@apollo/client'

const client = new ApolloClient({
  url: 'https://svilengrad.stepzen.net/api/winning-panda/__graphql',
  headers: {
    Authorization: `Apikey ${process.env.STEPZEN_API_KEY}`,
  },
  cache: new InMemoryCache(),
})

export default client
