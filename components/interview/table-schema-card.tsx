import type {TableSchema} from '@/lib/interview/system-design';
/** Shared by system-design solutions (```table-schema blocks) and SQL practice problems. */
export function TableSchemaCard({schema}:{schema:TableSchema}){
 return <figure className="iv-sd-schema" data-table-schema={schema.table}><figcaption><span>TABLE</span><b>{schema.table}</b></figcaption>
  <table><thead><tr><th scope="col">Column</th><th scope="col">Type</th><th scope="col">Key</th></tr></thead><tbody>{schema.columns.map(c=><tr key={c.name}><th scope="row">{c.name}{c.note?<small>{c.note}</small>:null}</th><td>{c.type}</td><td>{c.pk?<span className="iv-sd-pk" title="Primary key">PK</span>:null}</td></tr>)}</tbody></table>
  {schema.note?<p>{schema.note}</p>:null}</figure>;
}
