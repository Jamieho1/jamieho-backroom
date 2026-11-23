import {CompaniesDirectory} from '@/components/interview/companies-directory';
import {PagePreview} from '@/components/content-drafts/page-preview';
import {getHomePreview} from '@/lib/content-drafts/preview';
import {getCompanies} from '@/lib/interview/companies-data';
export const revalidate=60;
export default async function CompaniesPage(){const preview=await getHomePreview();try{const companies=await getCompanies(preview);return <><CompaniesDirectory companies={companies}/><PagePreview preview={preview?.companies?preview:null} page="/interview/companies"/></>;}catch{return <section className="iv-companies"><h1>Companies</h1><p role="alert">Could not load companies. Please reload to retry.</p></section>;}}
