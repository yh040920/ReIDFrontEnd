<template>
    <el-card>
        <el-table :data="tableData" style="width: 100%" stripe @selection-change="handleSelectionChange" table-layout="auto">
            <el-table-column type="selection" width="55" />
            <el-table-column label="摄像头名称" prop="CameraId"/>
            <el-table-column label="RTSP输入" prop="RTSPinput"/>
            <!-- <el-table-column label="RTSP输出" prop="RTSPoutput"/> -->
            <el-table-column label="经纬度" prop="Location"/>
            <el-table-column label="是否展示" prop="Show">
                <template #default="scope">
                    <el-tag
                    :type="scope.row.Show === 0 ? 'danger' : 'success'"
                    disable-transitions
                    effect="dark"
                    ></el-tag
                    >
                </template>
            </el-table-column>
            <el-table-column label="是否启动" prop="Lunch" width="200">
                <template #default="scope">
                    <el-tag
                    :type="scope.row.Lunch === 0 ? 'danger' : 'success'"
                    disable-transitions
                    effect="dark"
                    ></el-tag
                    >
                </template>
            </el-table-column>
            <el-table-column label="是否检测" prop="Detect" width="200">
                <template #default="scope">
                    <el-tag
                    :type="scope.row.Detect === 0 ? 'danger' : 'success'"
                    disable-transitions
                    effect="dark"
                    ></el-tag
                    >
                </template>
            </el-table-column>
            <el-table-column align="right">
                <template #header>
                    <div style="display: flex; justify-content: right;">
                        <el-input style="width: 20%; margin-right: 20px;" v-model="search" size="small" placeholder="搜索名称" />
                        <el-button
                            size="small"
                            type="primary"
                            @click="dialogFormVisible2 = true">
                            批量添加
                        </el-button>
                        <el-button
                            size="small"
                            type="primary"
                            @click="dialogFormVisible = true">
                            添加
                        </el-button>
                        <el-button
                            size="small"
                            type="danger"
                            @click="handleDeleteSelected"
                            :disabled="!isClick">
                            删除所选
                        </el-button>
                    </div>
                </template>
                <template #default="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">
                        编辑
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        
        <el-dialog v-model="drawer2" title="编辑" width="500">
            <el-form :model="formEdit" :rules="rulesEdit" ref="EditRef" label-width="140px">
                <el-form-item label="摄像头名字：" prop="CameraId">
                    <el-input v-model="formEdit.CameraId" />
                </el-form-item>
                <el-form-item label="经纬度：" prop="Location">
                    <el-input v-model="formEdit.Location"/>
                </el-form-item>
            </el-form>
            <template #footer>
                <div style="flex: auto">
                    <el-button @click="cancelClick">取消</el-button>
                    <el-button type="primary" @click="confirmClick">确定</el-button>
                </div>
            </template>
        </el-dialog>

        <el-dialog v-model="dialogFormVisible" title="添加" width="500">
            <el-form :model="formAdd" :rules="rules" ref="formRef" label-width="140px">
                <el-form-item label="摄像头名字：" prop="CameraId">
                    <el-input v-model="formAdd.CameraId" autocomplete="off" />
                </el-form-item>
                <el-form-item label="RTSP输入流：" prop="RTSPinput">
                    <el-input v-model="formAdd.RTSPinput" autocomplete="off" maxlength="10" />
                </el-form-item>
                <el-form-item label="经纬度：" prop="Location">
                    <el-input v-model="formAdd.Location"/>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogFormVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmAdd">
                    确定
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <el-dialog v-model="dialogFormVisible2" title="批量添加" width="500">
            <el-upload
                class="upload-demo"
                drag
                :action="csvUplod"
                multiple
                :on-success="handleSuccess"
            >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                拖拽文件<em>点击上传</em>
                </div>
                <template #tip>
                <div class="el-upload__tip">
                    csv文件可以上传
                </div>
                </template>
            </el-upload>
        </el-dialog>
    </el-card>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { ElMessage, ElForm } from 'element-plus';
import { reactive } from 'vue';
import { CameraService, CameraTable, edit, NormResponse, csvUplod } from '@/api/cameraManagementApi'

// 从父组件provide的内容中取出'camerasTable'，这是和父组件共享的，改变也会改变父组件的值
const tableData = inject('camerasTable', ref<CameraTable[]>([]));

const drawer2 = ref(false)

const formEdit = reactive<edit>({
    CameraId: "",
    Location: "",
    RTSPinput: ""
})

const formAdd = reactive<edit>({
    CameraId: "",
    RTSPinput: "",
    Location: ""
})

// 定义表单引用
const formRef = ref<InstanceType<typeof ElForm>>();
const EditRef = ref<InstanceType<typeof ElForm>>();

const dialogFormVisible = ref(false)
const dialogFormVisible2 = ref(false)

// 搜索关键词
const search = ref('');

// 存储选中的行
const selectedRows = ref<CameraTable[]>([]);

const isClick = ref(false)

// 定义校验规则
const rules = {
  CameraId: [
    { required: true, message: '摄像头名字不能为空', trigger: 'blur' }
  ],
  RTSPinput: [
    { required: true, message: 'RTSP输入流不能为空', trigger: 'blur' }
  ],
  Location: [
    { required: true, message: '经纬度不能为空', trigger: 'blur' }
  ]
};

const rulesEdit = {
    CameraId: [
    { required: true, message: '摄像头名字不能为空', trigger: 'blur' }
    ],
    Location: [
        { required: true, message: '经纬度不能为空', trigger: 'blur' }
    ]
}

const fetchTableData = async () => {
    tableData.value = (await CameraService.getCameraInfo()).data
};

// 处理编辑操作
const handleEdit = (index: number, row: CameraTable) => {
    drawer2.value = true
    formEdit.CameraId = row.CameraId
    formEdit.Location = row.Location
    formEdit.RTSPinput = row.RTSPinput
};

// 确定编辑
function confirmClick() {
    EditRef.value?.validate(async (valid) => {
        if (valid) {
            const editResult = await CameraService.editCamera(formEdit)
            if(editResult.success){
                ElMessage.error('编辑成功')
                drawer2.value = false
                fetchTableData()
            }else{
                ElMessage.error(editResult.error)
            }
        } else {
            ElMessage.error('输入不符合要求')
        }
    });
}

const confirmAdd = () => {
    formRef.value?.validate(async (valid) => {
        if (valid) {
            const addResult = await CameraService.addCamera(formAdd)
            if(addResult.success){
                ElMessage.error('添加成功')
                dialogFormVisible.value = false
                fetchTableData()
            }else{
                ElMessage.error(addResult.error)
            }
        } else {
            ElMessage.error('输入不符合要求')
        }
    });
}

const handleSuccess = (response: NormResponse, file: any, fileList: any) => {
    console.log(response.success)
    if(response.success){
        ElMessage.success("批量添加成功")
    }else{
        ElMessage.error("某些数据出错")
    }
    fetchTableData()
}

const confirmAdd2 = () => {
    dialogFormVisible2.value = false
}

// 处理删除操作
const handleDelete = (index: number, row: CameraTable) => {
    console.log(index, row);
};

// 处理选中行变化 此处接受的rows就是全部所选行
const handleSelectionChange = (rows: CameraTable[]) => {
    selectedRows.value = rows;
    console.log(selectedRows.value)
    if(selectedRows.value.length != 0){
        isClick.value = true
    }else{
        isClick.value = false
    }
};

// 处理删除所选操作
const handleDeleteSelected = async () => {
    console.log('所选行数据:', selectedRows.value);
    const data = selectedRows.value.map(item => {
        const { RTSPinput, ...rest } = item;
        return RTSPinput;
        })
    console.log(data)
    const deleteResult = await CameraService.deleteByCameraIds(data)
    if(deleteResult.success){
        ElMessage.success("成功删除")
        fetchTableData()
    }else{
        ElMessage.success(deleteResult.error)
    }
};

// 组件挂载时调用后端查询
onMounted(() => {
    
});

function cancelClick() {
  drawer2.value = false
}

</script>