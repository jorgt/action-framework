export async function getTestEntities(db) {
	return await db`
    select 
    t.id,
    t.name,
    t.created_at,
    t.updated_at,
    s.status_code,
    s.entity_type,
    case when l.entity_id is not null then true else false end as locked,
    st.description as status_description,
    (
      select json_agg(a.*)
      from available_sequences_for_entity as a
      where a.entity_id = t.id
    ) as sequences
  from test_entities as t
  inner join entity_status as s on t.id = s.entity_id
  inner join statuses as st on s.status_code = st.code
  left outer join event_lock as l on s.entity_id = l.entity_id and l.entity_type = s.entity_type
  order by t.name asc
  `;
}

export async function getTestEntity(db, entity) {
	const res = await db`
      select 
      t.id,
      t.name,
      t.created_at,
      t.updated_at,
      s.status_code,
      s.entity_type,
      case when l.entity_id is not null then true else false end as locked,
      st.description as status_description,
      (
        select json_agg(a.*)
        from available_sequences_for_entity as a
        where a.entity_id = t.id
      ) as sequences
    from test_entities as t
    inner join entity_status as s on t.id = s.entity_id
    inner join statuses as st on s.status_code = st.code
    left outer join event_lock as l on s.entity_id = l.entity_id and l.entity_type = s.entity_type
    where t.id = ${entity}
    order by t.name asc
  `;

	return res[0];
}
