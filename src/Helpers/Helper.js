import crypto from 'crypto'
import cookieCutter from 'cookie-cutter'
import Cookies from 'universal-cookie';
import moment from 'moment';
import { configs } from '../config';

export const encryptData = (data = '') => {
  if (data == '') {
    return data
  }
  //  crypto 
  let iv = (process.env.REACT_APP_ENCRYPT_IV).slice(0, 16);
  let encKey = (process.env.REACT_APP_ENCRYPT_KEY).slice(0, 16);
  let mykey = crypto.createCipheriv('aes-128-cbc', encKey, iv);
  let token = mykey.update((data).toString(), 'utf8', 'hex')
  token += mykey.final('hex');


  return token
}
export const decryptData = (token = '') => {
  if (token == '') {
    return token
  }

  let iv = (process.env.REACT_APP_ENCRYPT_IV).slice(0, 16);
  let encKey = (process.env.REACT_APP_ENCRYPT_KEY).slice(0, 16);
  let mykey = crypto.createDecipheriv('aes-128-cbc', encKey, iv);
  var data = mykey.update((token).toString(), 'hex', 'utf8')
  data += mykey.final('utf8');
  return data

}

export const GetCookie = (cookieName = '') => {
  if (!cookieName || cookieName == '') {
    return false;
  }

  // Get a cookie
  let getCookie = cookieCutter.get(cookieName)
  return getCookie ? decryptData(getCookie) : false
}

export const SetCookie = (cookieName = '', value, options = null, encrypt = true, setDefaultOpts = true) => {
  if (!cookieName || cookieName == '' || !value || value == '') {
    return false;
  }
  if (options == null) {
    options = {}
    options.path = '/'
  } else {
    if (!options.path) {
      options.path = '/'
    }
  }
  if (setDefaultOpts) {
    if (!options.secure) {
      options.secure = process.env.HTTPS ? true : false;
    }
    if (!options.sameSite) {
      options.sameSite = "Strict";
    }
  }
  let now = new Date()
  options.expires = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 60)
  // Set a cookie
  let data = encrypt ? encryptData(value) : value;
  let cookies = new Cookies();
  let setCookie = cookies.set(cookieName, data, options)
  return setCookie ? setCookie : false
}

export const DelCookie = (cookieName = '') => {
  if (!cookieName || cookieName == '') {
    return false;
  }

  // Delete a cookie
  let setCookie = cookieCutter.set(cookieName, '', { expires: new Date(0), path: '/' })
  return setCookie ? setCookie : false

}

export const GetRandomColor = () => {
  var letters = "0123456789ABCDEF";
  let colors = ['#7d7d7d94', '#e31e1e8c', '#b1d8ec', '#00b8ff', '#309e7b', '#ffc107']
  let selColor = colors[Math.floor(Math.random() * colors.length)]
  return "#000"
}

export const GetInitials = (str = '') => {
  if (str == '') {
    return ''
  }
  let name = str.split(' ');
  let fInitial = name[0] ? name[0].substr(0, 1) : '#';
  let lInitial = name[1] ? name[1].substr(0, 1) : '';
  let result = `${fInitial} ${lInitial}`
  return result
}

export const ChangeDateFormat = (date, type = 1, format = 0, dateStr) => {
  /*
      type:
      1 = 'a day ago format'
      2 = 'custom format' 
      3 = 'return date Object {year:123,month:12,date:12,hour:1,min:1, sec:01}' 
   */
  let customFormat = ''
  if (type == 1) {
    let pDate = new Date();
    if (dateStr) {
      pDate = new Date(date);
    } else {
      pDate = new Date(date);
    }

    customFormat = pDate;
    var cDate = new Date();
    var timeDiff = (cDate.getTime() - pDate.getTime()) / 1000;
    var day = 24 * 60 * 60;
    var d = (timeDiff) / day;
    if (d > 1) {
      customFormat = ChangeDateFormat(date, 2, format, false)
    }
    else {
      customFormat = CalcTime(2, timeDiff)
    }
  }
  else if (type == 2) {
    let pDate = new Date(date);
    customFormat = pDate;
    var Y = pDate.getFullYear();
    var m = pDate.getMonth();
    if ([0, 1].indexOf(format) == -1) {
      m = ('00' + (m + 1)).slice(-2);
    }
    var monArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    let d = pDate.getDate();
    d = ('00' + d).slice(-2);
    var H = pDate.getHours();
    H = ('00' + ((H < 12) ? H : H - 12)).slice(-2);
    var amOrPm = (pDate.getHours() < 12) ? "AM" : "PM";
    var i = pDate.getMinutes();
    i = ('00' + i).slice(-2);
    var s = pDate.getSeconds();
    s = ('00' + s).slice(-2);
    /*
      format
      0 = Mar 01 2021
      1 = 07:00 PM Mar 4 2021
      2 = mm/dd/YYY
      3 = Y-m-d
      4 = DD-MM-YYYY
     */
    switch (format) {
      case 0:
        customFormat = `${monArr[m]} ${d} ${Y}`;
        break;
      case 1:
        customFormat = `${H}:${i} ${amOrPm} ${monArr[m]} ${d} ${Y}`;
        break;
      case 2:
        customFormat = `${m}/${d}/${Y}`;
        break;
      case 3:
        customFormat = `${Y}-${m}-${d}`;
        break;
      case 4:
        customFormat = `${d}-${m}${Y}`;
        break;
      default:
        customFormat = `${monArr[m]} ${d},${Y} ${H}:${i}`;
        break;
    }

  } else {

  }
  return customFormat;
}

export const FormatDate = (e = null, number = '', formatType = 0) => {
  /*
      0 default mm/dd/yyyy format
      1 yyyy-mm-dd format 
  */
  switch (formatType) {
    case 0:
      break;
    case 1:
      if (number && number.length > 0) {
        let tempDate = number;
        tempDate = tempDate.split('T')
        tempDate = tempDate[0].split('-')
        number = [tempDate[1], '/', tempDate[2], '/', tempDate[0]].join('')
      }
      break;
  }
  let ele = e ? e.target : e
  var tempNum = ('' + number).replace(/\D+/g, '');
  let matchPattern = new RegExp(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);
  if (tempNum.length >= 8) {
    tempNum = tempNum.slice(0, 8)
  }
  var match = tempNum.match(matchPattern);
  if (match) {
    let intlCode = '';
    let newFormat = '';
    if (match[1] && match[2] && match[3]) {
      newFormat = [match[1], '/', match[2], '/', match[3]].join('')
    } else if (match[1] && match[2]) {
      newFormat = [match[1], '/', match[2]].join('')
    } else if (match[1]) {
      newFormat = [match[1]].join('')
    }
    if (ele) {
      ele.value = newFormat
    } else {
      return newFormat
    }
  }
  return null;
}

export const CalcTime = (type = 0, timeDiff = 0) => {
  let result = false;
  let time;
  let timeAlias;
  let tempTime;
  // type => 0 = seconds,1 = minutes,2 = hours
  switch (type) {
    case 0:
      time = 1;
      tempTime = timeDiff / time;
      timeAlias = 'sec'
      break;
    case 1:
      time = 60
      tempTime = timeDiff / time;
      timeAlias = 'min'
      break;
    case 2:
      time = 60 * 60
      tempTime = timeDiff / time;
      timeAlias = 'hr';
      break;
    default:
      timeAlias = 'Just Now'
  }

  if (tempTime < 1) {
    result = CalcTime(type - 1, timeDiff)
  }
  else {
    if (timeAlias == 'Just Now') {
      result = timeAlias
    }
    else {
      result = `${Math.floor(tempTime)} ${timeAlias} ago`;
    }
  }
  return result;
}

export const IsValidImgUrl = async (url, prefix = '') => {
  let result = await new Promise((resolve, reject) => {
    var img = new Image();
    let result = false
    img.onload = function () { resolve(true) };
    img.onerror = function () { resolve(false) };
    img.src = prefix + url;
  })
  return result

}

export const FetchUrlInfo = (url = '') => {
  if (url == '') {
    return false
  }
  let { hostname } = new URL(url);
  return hostname
}

export const FormatPhoneNumber = (e = null, number = '') => {
  let ele = e ? e.target : e
  var tempNum = ('' + number).replace(/\D/g, '');
  let matchPattern;
  if (tempNum.length >= 12) {
    tempNum = tempNum.slice(0, 12)
    matchPattern = new RegExp(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})$/)
  } else if (tempNum.length == 11) {
    matchPattern = new RegExp(/^(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,4})$/)
  } else {
    matchPattern = new RegExp(/^(\d{0,3})(\d{0,3})(\d{0,4})$/)
  }
  var match = tempNum.match(matchPattern);
  if (match) {
    let intlCode = '';
    let newFormat = ''
    if (tempNum.length > 10) {
      intlCode = (match[1] ? `+${match[1]} ` : '');
      newFormat = [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('')
    } else {
      if (match[1] && match[2] && match[3]) {
        newFormat = ['(', match[1], ') ', match[2], '-', match[3]].join('')
      } else if (match[1] && match[2]) {
        newFormat = ['(', match[1], ') ', match[2]].join('')
      } else if (match[1]) {
        newFormat = ['(', match[1]].join('')
      }
    }
    if (ele) {
      ele.value = newFormat
    } else {
      return newFormat
    }
  }
  return null;
}

export const OnImgErr = (ev = null, type = 'institution') => {
  if (ev == null) {
    return false
  }
  switch (type) {
    case 'institution':
      ev.target.onerror = null;
      ev.target.src = `${process.env.s3ImgUrl}institutions/default-inst.png`
      break;
    case 'degree':
      ev.target.onerror = null;
      ev.target.src = `${process.env.siteUrl}assets/img/deg_default_icon.png`
      break;
    default:
      ev.target.onerror = null;
      ev.target.src = `${process.env.s3ImgUrl}institutions/default-inst.png`
      break;
  }
  return
}

export const GenMD5Hash = (str = '') => {
  let result = ''
  if (!str || str.length == 0) {
    return false
  }

  let md5Hash = crypto.createHash('md5').update(str).digest("hex");
  result = md5Hash ? md5Hash : '';
  return result
}

export const sortArr = (obj = null) => {
  if (obj == null) {
    return false
  }
  let { sortBy = null, sortOrder = null, activeCol = null, activeSortOrder = null, items = null } = obj

  if (sortBy == null || sortOrder == null || activeCol == null, activeSortOrder == null, items == null) {
    return false
  }

  let tempArr = items || [];
  tempArr.sort((a, b) => {
    let x, y
    if(configs.DATE_SORT_ARR.includes(sortBy)){
      x = a[sortBy] ? moment( a[sortBy], "MMM DD YYYY").unix() : 0
      y = b[sortBy] ? moment( b[sortBy], "MMM DD YYYY").unix() : 0
    }else{
      x = a[sortBy] ? (typeof a[sortBy] == "string" ? a[sortBy].toString().toLowerCase() : a[sortBy]) : ""
      y = b[sortBy] ? (typeof b[sortBy] == "string" ? b[sortBy].toString().toLowerCase() : b[sortBy]) : ""
    }
    
    if (sortOrder == 'ASC') {
      return x == y ? 0 : x < y ? 1 : -1;
    }
    else {
      return x == y ? 0 : x > y ? 1 : -1;
    }
  })

  return tempArr
}


export const _Id = (el) => {
  return document.getElementById(el);
}

export const mentionStrToHtml = (str = null) => {
  if (str == null) {
    return false
  }
  let delTagPattern = /<(.*?)>([^<\/*>]+)<(\/.*?)>/
  let delTagRegexExp = new RegExp(delTagPattern, 'ig')
  let tmpStr = str.replace(delTagRegexExp, '$2')
  let filterStr = tmpStr.replace(/@\[([^\]]+)\]\(([^\)]*)\)/g, `<span class="mention_card_box">@$1</span>`)
  return (
    <span dangerouslySetInnerHTML={{ __html: filterStr }}></span>
  )
}
export const SanitizeHtml = (str = null) => {
  if (str == null) {
    return false
  }
  // pattern for complete tag
  let delTagPattern = /<(.*?)>([^<\/*>]+)<(\/.*?)>/
  let delTagRegexExp = new RegExp(delTagPattern, 'ig')
  let filterStr = str.replace(delTagRegexExp, '$2')
  // pattern for single or self closing tag
  let delsingleTagPattern = /<([^<*>]+)>/
  let delsingleTagRegexExp = new RegExp(delsingleTagPattern, 'ig')
  filterStr = filterStr.replace(delsingleTagRegexExp, '')
  return filterStr
}

export const compareObjs = (object1, object2) => {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  const isObject = (object) => {
    return object != null && typeof object === 'object';
  }
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (
      areObjects && !compareObjs(val1, val2) ||
      !areObjects && val1 !== val2
    ) {
      return false;
    }
  }
  return true;
}
export const isObjInclude = (arr = [], obj = null) => {
  if (!arr || arr.length == 0 || !obj) {
    return false
  }
  for (let item of arr) {
    let isEquals = compareObjs(item, obj)
    if (compareObjs(item, obj)) {
      return true
    }
  }
  return false
}

export const fetchDate = (val = null, data = {}) => {
  const { unixTimeStamp = false, defaultFormat = "MMM DD, YYYY", format = null } = data
  let today = moment().endOf("day").format(defaultFormat);
  let date = today
  if (unixTimeStamp) {
    date = moment(val || today, defaultFormat).unix()
  } else {
    switch (val) {
      case "today":
        date = moment().endOf("day");
        break;
      case "tomorrow":
        date = moment().add(1, "day").endOf("day");
        break;
      case "yesterday":
        date = moment().add(-1, "day").endOf("day");
        break;
    }
  }
  return date;
}

export const errorData = async (pageUrl = "") => {
  let errorDetails = {};
  if (pageUrl != "") {
    let path = window.location.pathname;
    if(path.includes('task-details')) {
      const taskEncId = path.split("/").pop();
      let taskDetails =  decryptData(taskEncId);
      let taskData =  JSON.parse(taskDetails);
      let pageName = 'task-details';
      errorDetails = {
        'entityId' : taskData?.taskId,
        'entityName' : pageName.replace("-", " "),
        'pageName' : pageName,
      }
      return errorDetails;
    }

    if(path.includes('dashboard')) {
      let pageName = 'dashboard';
      errorDetails = {
        'entityId' : 0,
        'entityName' : pageName,
        'pageName' : pageName,
      }
      return errorDetails;
    }
    if(path.includes('settings')) {
      let pageName = 'settings';
      errorDetails = {
        'entityId' : 0,
        'entityName' : pageName,
        'pageName' : pageName,
      }
      return errorDetails;
    }
    if(path.includes('task-manager')) {
      let pageName = 'task-manager';
      errorDetails = {
        'entityId' : 0,
        'entityName' : pageName.replace("-", " "),
        'pageName' : pageName,
      }
      return errorDetails;
    }
    if(path.includes('evidence-manager')) {
      let pageName = 'evidence-manager';
      errorDetails = {
        'entityId' : 0,
        'entityName' : pageName.replace("-", " "),
        'pageName' : pageName,
      }
      return errorDetails;
    }
    if(path.includes('audit-console/insights')) {
      let pageName = 'audit-console/insights';
      let entityName  = pageName.replace("/", " ");
      errorDetails = {
        'entityId' : 0,
        'entityName' : entityName.replace("-", " "),
        'pageName' : pageName,
      }
      return errorDetails;
    }

    if(path.includes('audit-console/manager')) {
      let pageName = 'audit-console/manager';
      let entityName  = pageName.replace("/", " ");
      errorDetails = {
        'entityId' : 0,
        'entityName' : entityName.replace("-", " "),
        'pageName' : pageName,
      }
      return errorDetails;
    }
    if(path.includes('configuration')) {
      let pageName = 'configuration';
      errorDetails = {
        'entityId' : 0,
        'entityName' : pageName,
        'pageName' : pageName,
      }
      return errorDetails;
    }
    if(path.includes('configuration/users')) {
      let pageName = 'configuration/users';
      errorDetails = {
        'entityId' : 0,
        'entityName' : pageName.replace("/", " "),
        'pageName' : pageName,
      }
      return errorDetails;
    }
    if(path.includes('configuration/tps')) {
      let pageName = 'configuration/tps';
      errorDetails = {
        'entityId' : 0,
        'entityName' : pageName.replace("/", " "),
        'pageName' : pageName,
      }
      return errorDetails;
    }
    if(path.includes('configuration_scope')) {
      let pageName = 'configuration_scope';
      const encId = path.split("/").pop();
      let id =  decryptData(encId);
      errorDetails = {
        'entityId' : id,
        'entityName' : pageName.replace("_", " "),
        'pageName' : pageName,
      }
      return errorDetails;
    }
    if(path.includes('audit-logs')) {
      let pageName = 'audit-logs';
      errorDetails = {
        'entityId' : 0,
        'entityName' : pageName.replace("-", " "),
        'pageName' : pageName,
      }
      return errorDetails;
    }
    if(path.includes('vendors/dashboard')) {
      let pageName = 'vendors/dashboard';
      errorDetails = {
        'entityId' : 0,
        'entityName' : pageName.replace("/", " "),
        'pageName' : pageName,
      }
      return errorDetails;
    }

    if(path.includes('vendors/manage')) {
      let pageName = 'vendors/manage';
      errorDetails = {
        'entityId' : 0,
        'entityName' : pageName.replace("/", " "),
        'pageName' : pageName,
      }
      return errorDetails;
    }
    if(path.includes('vendors/assessment')) {
      let pageName = 'vendors/assessment';
      errorDetails = {
        'entityId' : 0,
        'entityName' : pageName.replace("/", " "),
        'pageName' : pageName,
      }
      return errorDetails;
    }
    if(path.includes('vendors/questionnaire')) {
      let pageName = 'vendors/questionnaire';
      errorDetails = {
        'entityId' : 0,
        'entityName' : pageName.replace("/", " "),
        'pageName' : pageName,
      }
      return errorDetails;
    }
    if(path.includes('vendors/evidence-manager')) {
      let pageName = 'vendors/evidence-manager';
      let entityName = pageName.replace("/", " ")
      errorDetails = {
        'entityId' : 0,
        'entityName' : entityName.replace("-", " "),
        'pageName' : pageName,
      }
      return errorDetails;
    }
    if(path.includes('vendors/configuration')) {
      let pageName = 'vendors/configuration';
      errorDetails = {
        'entityId' : 0,
        'entityName' : pageName.replace("/", " "),
        'pageName' : pageName,
      }
      return errorDetails;
    }
    if(path.includes('enquiryform')) {
      let pageName = 'enquiryform';
      const eqId = path.split("/").pop();
      errorDetails = {
        'entityId' : eqId,
        'entityName' : pageName,
        'pageName' : pageName,
      }
      return errorDetails;
    }
  }
  return true;
}

export const setDocumentTitle = (str = null) => {
    if(str == null){
        return false
    }
    return document.title = str
}

export const getFileName = (file = null) => {
  if (file == null) {
    return '';
  }
  if(file instanceof File){
    return file.name
  }else{
    return (file).substr((file).lastIndexOf('/') + 1)
  }
  
}