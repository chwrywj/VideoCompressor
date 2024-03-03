import { createI18n } from "vue-i18n";
const { ipcRenderer } = require('electron')

import bg from './bg.json'
import cs from './cs.json'
import da from './da.json'
import de from './de.json'
import el from './el.json'
import en from './en.json'
import es from './es.json'
import et from './et.json'
import fi from './fi.json'
import fr from './fr.json'
import hu from './hu.json'
import it from './it.json'
import ja from './ja.json'
import ko from './ko.json'
import nl from './nl.json'
import pl from './pl.json'
import pt from './pt.json'
import ro from './ro.json'
import ru from './ru.json'
import sl from './sl.json'
import sv from './sv.json'
import th from './th.json'
import vi from './vi.json'
import zh from './zh.json'
import zhTW from './zh-tw.json'

//获取语言码
var locale='en';
if(localStorage.getItem('locale')!=null){
  locale=localStorage.getItem('locale');
}else{
  locale = ipcRenderer.sendSync('getLocale');
  if (locale == "zh-hk"){
    locale = "zh-tw";
  }
  var localeList=["bg", "cs", "da", "de", "el", "en", "es", "et", "fi", "fr", "hu", "it", "ja", "ko", "nl", "pl", "pt", "ro", "ru", "sl", "sv", "th", "vi", "zh", "zh-tw"];
  if(!localeList.includes(locale)){
    if(locale.indexOf('-')!=-1){
      locale=locale.substring(0,locale.indexOf('-'));
    }
    if(!localeList.includes(locale)){
      locale="en";
    }
  }
  localStorage.setItem('locale',locale);
}

const i18n = createI18n({
   // 使用 Composition API 模式，则需要将其设置为false
   legacy: false,
   // 全局注入 $t 函数
   globalInjection: true,
   locale:locale,
   messages:{
    bg,cs,da,de,el,en,es,et,fi,fr,hu,it,ja,ko,nl,pl,pt,ro,ru,sl,sv,th,vi,zh,
    'zh-tw':zhTW
  }
 });

export default i18n