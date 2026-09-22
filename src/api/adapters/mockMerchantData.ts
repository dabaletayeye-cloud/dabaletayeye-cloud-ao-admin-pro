import { createMockBusiness } from './mockBusiness';
import type { ApiAdapter } from './types';
import type { Article, Category, Tag, ManagedFile } from '../types';

/** Each merchant owns separate data and blob stores. No swapping of shared mutable state. */
export function createMockMerchantData():Partial<ApiAdapter>{
  let articles:Article[]=[],categories:Category[]=[],tags:Tag[]=[],files:ManagedFile[]=[];const blobs=new Map<number,Blob>();let id=1000;
  const clone=<T>(value:T):T=>structuredClone(value);
  function update<T extends {id:number}>(rows:T[],key:number,input:Partial<T>){const row=rows.find(r=>r.id===key);if(!row)throw new Error('记录不存在或不属于当前商户');Object.assign(row,input,{id:key});return clone(row);}
  function remove<T extends {id:number}>(rows:T[],key:number){const index=rows.findIndex(r=>r.id===key);if(index<0)throw new Error('记录不存在或不属于当前商户');rows.splice(index,1);}
  return{
    ...createMockBusiness(true),
    async listArticles(query={}){const rows=articles.filter(r=>(!query.keyword||r.title.includes(query.keyword))&&(!query.status||r.status===query.status));const page=query.page??1,pageSize=query.pageSize??20;return clone({list:rows.slice((page-1)*pageSize,page*pageSize),total:rows.length,page,pageSize});},
    async createArticle(input){const row={cover:'',title:'',author:'',category:'',tags:[],views:0,status:'draft',publishTime:'',...input,id:++id} as Article;articles.push(row);return clone(row);},
    async updateArticle(key,input){return update(articles,key,input);},async deleteArticle(key){remove(articles,key);},
    async listCategories(){return clone(categories);},async createCategory(input){const row={name:'',slug:'',sort:1,description:'',articleCount:0,parentId:null,...input,id:++id} as Category;categories.push(row);return clone(row);},async updateCategory(key,input){return update(categories,key,input);},async deleteCategory(key){remove(categories,key);},
    async listTags(){return clone(tags);},async createTag(input){const row={name:'',articleCount:0,createdAt:'',status:'active',...input,id:++id} as Tag;tags.push(row);return clone(row);},async updateTag(key,input){return update(tags,key,input);},async deleteTag(key){remove(tags,key);},
    async listFiles(){return clone(files);},
    async getFileStorageInfo(){return {provider:'local',maxFileSize:50*1024*1024};},
    async uploadFiles(input,folder='uploads'){const rows=input.map(file=>{const key=++id;blobs.set(key,file);return{id:key,name:file.name,kind:file.type.startsWith('image/')?'image':'document',size:file.size,folder,path:`/mock/merchant/${key}`,provider:'local',uploader:'商户账号',updatedAt:new Date().toISOString()} as ManagedFile;});files.push(...rows);return clone(rows);},
    async downloadFile(key){const file=blobs.get(key);if(!file)throw new Error('文件不存在或不属于当前商户');return file;},async deleteFile(key){remove(files,key);blobs.delete(key);},
    async listOrders(){return[];},async getOrderStats(){return{total:0,pending:0,shipping:0,completed:0,cancelled:0,revenue:0};},async orderAction(){throw new Error('订单不存在或不属于当前商户');},
  };
}
