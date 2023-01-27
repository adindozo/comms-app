document.getElementById('menu-toggle').addEventListener('click',(e)=>{
    document.querySelector('.menu').style.left='0px';
})

document.querySelector('html').addEventListener('click',(e)=>{
    if(e.target.id!='menu-toggle') document.querySelector('.menu').style.left='-250px';
})