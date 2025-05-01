<template>
    <el-card shadow="never">
      <el-card shadow="never" style="border: none;">
            <el-text class="mx-1" size="large" style="font-weight: bold; font-size: 24px;">查询设置</el-text>
            <el-collapse style="width: 100%; border-top: none;" v-model="activeNames" @change="handleChange" >
                <el-collapse-item name="1">
                    <template #title>
                      <el-icon><Setting /></el-icon>
                      <el-text type="primary" size="large">Setting</el-text>
                    </template>
                    <el-row :gutter="20" >
                        <el-col :span="6">
                              <el-text>时间选择：</el-text>
                              <el-date-picker
                                  v-model="timeLimit"
                                  type="datetimerange"
                                  start-placeholder="开始时间"
                                  end-placeholder="截至时间"
                                  format="YYYY-MM-DD HH:mm:ss"
                                  date-format="YYYY/MM/DD ddd"
                                  time-format="A hh:mm:ss"
                              />
                        </el-col>
                        <el-col :span="4">
                              <el-text>摄像头选择：</el-text>
                              <el-select v-model="CameraId" placeholder="" style="width: 50%" filterable clearable>
                              <el-option
                                  v-for="item in options"
                                  :key="item.value"
                                  :label="item.label"
                                  :value="item.value"
                                  />
                              </el-select>
                        </el-col>
                        <el-col :span="1">
                          <el-button @click="search">查找</el-button>
                        </el-col>
                        <el-col :span="4">
                          
                        </el-col>
                    </el-row>
                    <div style="margin-top: 20px;"></div>
                    <div>
                      <el-text class="mx-1" size="large">选择的图片：</el-text>
                      <el-button :disabled="selected.length===0" style="border: none;" @click="import2Find">将选择的图片导入查找页</el-button>
                    </div>
                    <el-empty :image-size="50" v-if="selected.length === 0" description="暂无图片" :image="emptyImg"/>
                    <div v-else style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px;">
                      <el-card v-for="img in selected" shadow="hover" :body-style="{ padding: '3px' }" style="width: fit-content;" :key="img.url" @click="Delete(img)">
                        <img :src="img.url" style="height: 100px; width: auto;"/>
                      </el-card>
                    </div>
                </el-collapse-item>
            </el-collapse>
        </el-card>
        <el-card shadow="never" style="border: none;">
            <el-row justify="center">
                <el-col :span="7">
                    <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[50, 100, 150, 200, 250]"
                    :size="size"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="totalPages"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    />
                </el-col>
            </el-row>
            <el-divider />
            <el-empty v-if="images.length === 0" description="暂无图片" :image="emptyImg"/>
            <div v-else style="display: flex; flex-wrap: wrap; gap: 10px;">
                <el-card shadow="hover" :body-style="{ padding: '3px' }" style="width: fit-content;" v-for="img in images" :key="img.url" @click="select(img)">
                    <el-image style="width: auto; height: 10vh" :src="img.url"/>
                </el-card>
            </div>
        </el-card>
    </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CollapseModelValue, ComponentSize } from 'element-plus'
import emptyImg from '@/assets/img/state/empty.png';
import { router } from '@/router';
import { useSelectedStore } from '@/store/modules/useSelectedStore'
import { ImgManagementService, image } from '@/api/imgManagementApi'

onMounted(async ()=>{
  // const result = await ImgManagementService.getCameraNames();
  const result = {
    success: true,
    error: '',
    names: ['校门口', '图书馆门口']
  };
  if(result.success){
    options.value = result.names.map(item => ({
      value: item,
      label: item
    }));
  }else{
    ElMessage.error(result.error);
  }
})

const SelectedStore = useSelectedStore()

const activeNames = ref(['1'])
const timeLimit = ref('');

const handleChange = (val: CollapseModelValue) => {
  console.log(val)
}

const CameraId = ref('')

interface option {
  value: string;
  label: string;
}

const options = ref<option[]>([])

const currentPage = ref(1)
const size = ref<ComponentSize>('default')
const pageSize = ref(100)
const totalPages = ref(0)

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  search();
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  search();
}

const images = ref<image[]>([])
const selected = ref<image[]>([])

const select = (yyh: image) => {
  const isExists = selected.value.some(img => img.name === yyh.name && img.url === yyh.url);

  if(isExists){
    ElMessage.error('已选择');
  }else{
    selected.value.push(yyh);
  }
}

const Delete = (yyh: image) => {
  const index = selected.value.findIndex(img => 
    img.name === yyh.name && img.url === yyh.url
  );
  selected.value.splice(index, 1);
}

const search = async () =>{
  // const searchResult = await ImgManagementService.search({page: currentPage.value, timeLimit: timeLimit.value, CameraId: CameraId.value, pageSize: pageSize.value});
  const searchResult = {
    success: true,
    error: '',
    images: [
              {
                  name: 'food.jpeg',
                  url: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.UWgMkVm4bkDKwMOnrWZ0vAHaLt?w=115&h=180&c=7&r=0&o=5&dpr=1.8&pid=1.7',
              },
              {
                  name: 'food.jpeg',
                  url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
              }
            ],
    totalPages: 2
  }
  if(searchResult.success){
    images.value = searchResult.images
    totalPages.value = searchResult.totalPages
  }else{
    ElMessage.error(searchResult.error)
  }

}

const import2Find = () => {
  SelectedStore.setImages(selected.value)
  router.push({path: '/Find'})
}
</script>

<style scoped>
.scrollbar-flex-content {
  display: flex;
  width: fit-content;
}
.scrollbar-demo-item {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 50px;
  margin: 10px;
  text-align: center;
  border-radius: 4px;
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}
</style>