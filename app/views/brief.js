export async function show(get,slug,root){let x=await get('/competitions/'+slug);const {render}=await import('../detail.js');render(root,{competition:x,entries:x.submissions})}
