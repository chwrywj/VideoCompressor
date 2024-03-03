<template>
  <el-container>
    <el-main>
      <router-view v-slot="{ Component, route }">
        <keep-alive>
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
      </router-view>
    </el-main>
    <el-footer>
      <div class="footer">
        <div class="item" @click="languageDialogVisible=true;">
          <i class="my-icon my-icon-language"></i>
          <span>{{$t('common.language')}}</span>
        </div>
        <div class="item" @click="openBrowser('https://toollist.net/compress-video-desktop-app')">
          <i class="my-icon my-icon-tech-support"></i>
          <span>{{$t('common.support')}}</span>
        </div>
        <div class="item" @click="openBrowser('https://toollist.net/Donata?from=VideoCompress')">
          <i class="my-icon my-icon-donata"></i>
          <span>{{$t('common.donata')}}</span>
        </div>
      </div>
    </el-footer>

    <el-dialog :title="$t('common.language')"
      v-model="languageDialogVisible"
      width="600px">
      <el-row class="lang-list">
        <template v-for="(item,key) in languageList" :key="key">
          <el-col :xs="12" :sm="8" :lg="6" class="lang-item" :class="{'active':key==locale}">
            <div :data-lang-code="key" v-on:click="chooseLanguage">{{item}}</div>
          </el-col>
        </template>
      </el-row>
    </el-dialog>
  </el-container>
</template>

<script>
  import { defineComponent, ref, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from "vue-i18n"
  import common from './utils/common';

  export default defineComponent({
    name: 'App',
    setup() {
      const { t } = useI18n()
      document.title = t("common.title");
      
      const router = useRouter();
      const routerLink = (path) => {
        router.push(path);
      };

      const languageList = reactive(
        {'bg':'Български','cs':'Čeština','da':'Dansk','de':'Deutsch','el':'Ελληνικά','en':'English','es':'Español','et':'Eesti','fi':'Suomi','fr':'Français','hu':'Magyar','it':'Italiano','ja':'日本語','ko':'조선말','nl':'Nederlands','pl':'Polski','pt':'Português','ro':'Română','ru':'Русский','sl':'Slovenščina','sv':'Svenska','th':'ภาษาไทย','vi':'Tiếng Việt','zh':'简体中文','zh-tw':'繁體中文'}
      );
      let locale = ref(localStorage.getItem('locale'));
      let languageDialogVisible = ref(false);
      const i18n = useI18n();
      const chooseLanguage = (e) =>{
        var langCode = e.currentTarget.dataset.langCode;
        i18n.locale.value = langCode;
        locale.value = langCode;
        languageDialogVisible.value = false;
        document.title = t("common.title");
        localStorage.setItem('locale',langCode);
      }

      const openBrowser = (url) =>{
        common.openBrowser(url);
      };
      
      return {
        routerLink,

        languageList,
        locale,
        languageDialogVisible,
        chooseLanguage,

        openBrowser
      }
    }
  })
</script>

<style lang="scss" scoped>
  .el-container{height: 100vh;}
  .el-main{padding:0;overflow-x: auto;overflow-y: hidden;flex:1;display: flex;}
  .el-footer{
    height:40px;line-height:40px;padding:0 10px;
    .footer{
      display:flex;
      .item{
        display: flex;align-items: center;cursor: pointer;padding:0 15px;
        &:first-child{padding-left: 0;}
        i{margin-right:4px;font-size:16px;}
      }
      .item:hover{color:var(--el-color-primary);}
    }
  }

  .lang-list {
    background-color: #fff; 
    .lang-item { 
      text-align: center; line-height: 36px; cursor: pointer;
      &:hover,&.active{color:var(--el-color-primary)}
    }
  }
</style>
