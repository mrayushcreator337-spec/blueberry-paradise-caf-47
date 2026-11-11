import { queryOptions } from '@tanstack/react-query';
import { getContent } from './content.functions';
export const contentQuery=queryOptions({queryKey:['public-content'],queryFn:()=>getContent(),staleTime:60000});
