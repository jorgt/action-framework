export async function getQueue(db) {
	return await db`
  select 
    q.id, 
    q.entity_id, 
    q.entity_type, 
    q.action::jsonb as action, 
    q.payload, 
    q.result, 
    q.created_at, 
    q.start, 
    q.retries, 
    q.status
  from event_queue as q
  where status != 'PROCESSED'
  order by created_at desc
  limit 100
`;
}
