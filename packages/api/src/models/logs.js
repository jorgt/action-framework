export async function getLogs(db) {
  return await db`select 
    a.id, a.action_id, a.created_at, 
    b.description as action_description,
    b.code as action_code, 
    c.name as entity_name
    from action_log as a 
    inner join actions as b on a.action_id = b.id
    inner join test_entities as c on a.entity_id = c.id
    order by created_at desc
    limit 100`;
}
