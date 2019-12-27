//change these values to match the queue name and date range
//for the interactions that you wish to delete
var queueName = "AppFoundry";
var dateRange = "2019-12-01T00:00:00.000Z/2020-01-01T00:00:00.000Z";

// Don't change anything below

//use the session to interface with the API
var routingApi = new platformClient.RoutingApi();
var analyticsApi = new platformClient.AnalyticsApi();
var conversationsApi = new platformClient.ConversationsApi();

console.log("Getting the " + queueName + " queue");
var opts = { 
  'pageSize': 25,
  'pageNumber': 1,
  'sortBy': "name",
  'name': queueName,
  'id': [],
  'divisionId': []
};

routingApi.getRoutingQueues(opts)
  .then((data) => {
    console.log(`getRoutingQueues success! data: ${JSON.stringify(data, null, 2)}`);
    
    if ( data.entities !== undefined && data.entities.length === 1 ) {
      console.log("The ID for the " + queueName + " queue is: " + data.entities[0].id);
      
      var queryBody = {
                       "interval": dateRange,
                       "order": "asc",
                       "orderBy": "conversationStart",
                       "paging": {
                        "pageSize": 100,
                        "pageNumber": 1
                       },
                       "segmentFilters": [
                        {
                         "type": "or",
                         "predicates": [
                          {
                           "type": "dimension",
                           "dimension": "queueId",
                           "operator": "matches",
                           "value": data.entities[0].id
                          }
                         ]
                        }
                       ],
                       "conversationFilters": [
                        {
                          "type": "or",
                          "predicates": [
                           {
                            "type": "dimension",
                            "dimension": "conversationEnd",
                            "operator": "notExists",
                            "value": null
                           }
                          ]
                        }
                       ]
                      };

      analyticsApi.postAnalyticsConversationsDetailsQuery(queryBody)
      .then((data) => {
        console.log(`postAnalyticsConversationsDetailsQuery success! data: ${JSON.stringify(data, null, 2)}`);
        if ( data.conversations !== undefined ) {
          data.conversations.forEach(function(item, index){
            console.log("deleting conversation: " + item.conversationId);
            conversationsApi.postConversationDisconnect(item.conversationId)
            .then((data) => {
              console.log(`postConversationDisconnect success! data: ${JSON.stringify(data, null, 2)}`);
            })
            .catch((err) => {
              console.log('There was a failure calling postConversationDisconnect');
              console.error(err);
            });
          })
        } else {
          console.log('No conversations to disconnect');
        }
      })
      .catch((err) => {
        console.log('There was a failure calling postAnalyticsConversationsDetailsQuery');
        console.error(err);
      });
    }
  })
  .catch((err) => {
    console.log('There was a failure calling getRoutingQueues');
    console.error(err);
  });