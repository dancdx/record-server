function accAdd (arg1, arg2) {
  var r1,r2,m;
  try{r1=arg1.toString().split(".")[1].length;}catch(e){r1=0;}
  try{r2=arg2.toString().split(".")[1].length;}catch(e){r2=0;}
  m=Math.pow(10,Math.max(r1,r2));
  return (accMul(arg1,m)+accMul(arg2,m))/m;
}

function dcmSub(arg1,arg2){
  return accAdd(arg1,-arg2);
}

function  dcmYu(arg1,arg2){
  var r1,r2,m;
  try{r1=arg1.toString().split(".")[1].length;}catch(e){r1=0;}
  try{r2=arg2.toString().split(".")[1].length;}catch(e){r2=0;}
  m=Math.pow(10,Math.max(r1,r2))
  return (accMul(arg1,m)%accMul(arg2,m))/m
}

//调用：accDiv(arg1,arg2) //返回值：arg1除以arg2的精确结果 
function accDiv(arg1,arg2){
  var t1=0,t2=0,r1,r2; 
  try{
    t1=arg1.toString().split(".")[1].length
  }catch(e){}
  try{
    t2=arg2.toString().split(".")[1].length
  }catch(e){}
  r1=Number(arg1.toString().replace(".",""))
  r2=Number(arg2.toString().replace(".",""))
  return (r1/r2)*Math.pow(10,t2-t1)
}
//乘法函数，用来得到精确的乘法结果 
//说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。 
//调用：accMul(arg1,arg2) //返回值：arg1乘以arg2的精确结果 
function accMul(arg1,arg2){ 
  var m=0,s1=arg1.toString(),s2=arg2.toString();
  try{m+=s1.split(".")[1].length}catch(e){}
  try{m+=s2.split(".")[1].length}catch(e){}
  return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m)
}
// 转化成小数, 原函数toDecimal(datavalue)存在的精度问题，因涉及过多屏蔽。 
function toDecimal (datevalue){
  if(datevalue.indexOf('%') !== -1){
    datevalue = datevalue.replace(/%/g,'')
    if(datevalue.indexOf(',') !== -1) {
      datevalue = datevalue.replace(/,/g,'')
    }
    // 除100精度在原有基础上增加2位。
    var decimal = (datevalue.indexOf('.') === -1) ? 0 : (datevalue.length - datevalue.indexOf('.') - 1); 
    datevalue = accDiv(datevalue, 100).toFixed(decimal + 2);
  } else {  
    if(datevalue.indexOf(',') !== -1){
      datevalue = datevalue.replace(/,/g,'')
    }
  }
  return datevalue
}
// 将小数转换为百分数。 
function toPercentFormat(datevalue) {
  var aa = accMul(datevalue, 100)
  return "" + aa + "%"
}

module.exports = {
  add: accAdd,
  sub: dcmSub,
  mul: accMul,
  div: accDiv,
  yu: dcmYu
}
