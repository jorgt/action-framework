async function entitiesRoutes(app, options) {
  const { db } = app.db;

  app.get('/dashboard', async (request, reply) => {
    // Fetch all entities from your data source
    const hours = await db`select * from queue_count_rolling_100_hours`;
    const days = await db`select * from queue_count_rolling_100_days`;
    reply.send({
      success: true,
      hours,
      days,
    });
  });
}

export default entitiesRoutes;
