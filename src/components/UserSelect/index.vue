<template>
  <div>
    <el-dialog v-model="userDialog.visible.value" :title="userDialog.title.value" width="80%" append-to-body>
      <el-row :gutter="20">
        <el-col :lg="20" :xs="24">
          <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
            <div v-show="showSearch" class="mb-[10px]">
              <el-card shadow="hover">
                <el-form ref="queryFormRef" :model="queryParams" :inline="true">
                  <el-form-item label="用户名称" prop="userName">
                    <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable @keyup.enter="handleQuery" />
                  </el-form-item>
                  <el-form-item label="手机号码" prop="phonenumber">
                    <el-input v-model="queryParams.phonenumber" placeholder="请输入手机号码" clearable @keyup.enter="handleQuery" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                    <el-button icon="Refresh" @click="() => resetQuery()">重置</el-button>
                  </el-form-item>
                </el-form>
              </el-card>
            </div>
          </transition>

          <el-card shadow="hover">
            <template v-if="prop.multiple" #header>
              <el-tag v-for="user in selectUserList" :key="user.userId" closable style="margin: 2px" @close="handleCloseTag(user)">
                {{ user.userName }}
              </el-tag>
            </template>

            <vxe-table
              ref="tableRef"
              height="400px"
              border
              show-overflow
              :data="userList"
              :loading="loading"
              :row-config="{ keyField: 'userId', isHover: true }"
              :checkbox-config="{ reserve: true, trigger: 'row', highlight: true, showHeader: prop.multiple }"
              @checkbox-all="handleCheckboxAll"
              @checkbox-change="handleCheckboxChange"
            >
              <vxe-column type="checkbox" width="50" align="center" />
              <vxe-column key="userId" title="用户编号" align="center" field="userId" />
              <vxe-column key="userName" title="用户名称" align="center" field="userName" />
              <vxe-column key="nickName" title="用户昵称" align="center" field="nickName" />
              <vxe-column key="phonenumber" title="手机号码" align="center" field="phonenumber" width="120" />
              <vxe-column key="status" title="状态" align="center">
                <template #default="scope">
                  <dict-tag :options="sys_normal_disable" :value="scope.row.status"></dict-tag>
                </template>
              </vxe-column>

              <vxe-column title="创建时间" align="center" width="160">
                <template #default="scope">
                  <span>{{ scope.row.createTime }}</span>
                </template>
              </vxe-column>
            </vxe-table>

            <pagination
              v-show="total > 0"
              v-model:page="queryParams.pageNum"
              v-model:limit="queryParams.pageSize"
              :total="total"
              @pagination="pageList"
            />
          </el-card>
        </el-col>
      </el-row>

      <template #footer>
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import api from '@/api/system/user';
import { UserQuery, UserVO } from '@/api/system/user/types';
import { VxeTableInstance } from 'vxe-table';
import useDialog from '@/hooks/useDialog';

interface PropType {
  modelValue?: UserVO[] | UserVO | undefined;
  multiple?: boolean;
  data?: string | number | (string | number)[];
}
const prop = withDefaults(defineProps<PropType>(), {
  multiple: true,
  modelValue: undefined,
  data: undefined
});
const emit = defineEmits(['update:modelValue', 'confirmCallBack']);

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const userList = ref<UserVO[]>();
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);
const selectUserList = ref<UserVO[]>([]);

const queryFormRef = ref<ElFormInstance>();
const tableRef = ref<VxeTableInstance<UserVO>>();

const userDialog = useDialog({
  title: '用户选择'
});

const queryParams = ref<UserQuery>({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  phonenumber: '',
  status: '',
  roleId: ''
});

const defaultSelectUserIds = computed(() => computedIds(prop.data));

const confirm = () => {
  emit('update:modelValue', selectUserList.value);
  emit('confirmCallBack', selectUserList.value);
  userDialog.closeDialog();
};

const computedIds = (data) => {
  if (data instanceof Array) {
    return [...data];
  } else if (typeof data === 'string') {
    return data.split(',');
  } else if (typeof data === 'number') {
    return [data];
  } else {
    console.warn('<UserSelect> The data type of data should be array or string or number, but I received other');
    return [];
  }
};

/** 通过条件过滤节点  */
const filterNode = (value: string, data: any) => {
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
};

/** 查询用户列表 */
const getList = async () => {
  loading.value = true;
  const res = await api.listUser(proxy?.addDateRange(queryParams.value, dateRange.value));
  loading.value = false;
  userList.value = res.rows;
  total.value = res.total;
};

const pageList = async () => {
  await getList();
  const users = userList.value.filter((item) => {
    return selectUserList.value.some((user) => user.userId === item.userId);
  });
  await tableRef.value.setCheckboxRow(users, true);
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
/** 重置按钮操作 */
const resetQuery = (refresh = true) => {
  dateRange.value = ['', ''];
  queryFormRef.value?.resetFields();
  queryParams.value.pageNum = 1;
  refresh && handleQuery();
};

const handleCheckboxChange = (checked) => {
  if (!prop.multiple && checked.checked) {
    tableRef.value.setCheckboxRow(selectUserList.value, false);
    selectUserList.value = [];
  }
  const row = checked.row;
  if (checked.checked) {
    selectUserList.value.push(row);
  } else {
    selectUserList.value = selectUserList.value.filter((item) => {
      return item.userId !== row.userId;
    });
  }
};
const handleCheckboxAll = (checked) => {
  const rows = userList.value;
  if (checked.checked) {
    rows.forEach((row) => {
      if (!selectUserList.value.some((item) => item.userId === row.userId)) {
        selectUserList.value.push(row);
      }
    });
  } else {
    selectUserList.value = selectUserList.value.filter((item) => {
      return !rows.some((row) => row.userId === item.userId);
    });
  }
};

const handleCloseTag = (user: UserVO) => {
  const userId = user.userId;
  // 使用split删除用户
  const index = selectUserList.value.findIndex((item) => item.userId === userId);
  const rows = selectUserList.value[index];
  tableRef.value?.setCheckboxRow(rows, false);
  selectUserList.value.splice(index, 1);
};

const initSelectUser = async () => {
  if (defaultSelectUserIds.value.length > 0) {
    const { data } = await api.optionSelect(defaultSelectUserIds.value);
    selectUserList.value = data;
    const users = userList.value.filter((item) => {
      return defaultSelectUserIds.value.includes(String(item.userId));
    });
    await nextTick(() => {
      tableRef.value.setCheckboxRow(users, true);
    });
  }
};
const close = () => {
  userDialog.closeDialog();
};

watch(
  () => userDialog.visible.value,
  async (newValue: boolean) => {
    if (newValue) {
      await getList(); // 初始化列表数据
      await initSelectUser();
    } else {
      tableRef.value.clearCheckboxReserve();
      tableRef.value.clearCheckboxRow();
      resetQuery(false);
      selectUserList.value = [];
    }
  }
);

defineExpose({
  open: userDialog.openDialog,
  close: userDialog.closeDialog
});
</script>

<style lang="scss" scoped></style>
