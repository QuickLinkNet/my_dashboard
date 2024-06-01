<template>
  <div class="todo-container">
    <h1>ToDo List</h1>
    <div class="flex-container">
      <Button @click="toggleDialog" label="Add ToDo" icon="pi pi-plus" class="flex-item"/>
      <Calendar v-model="selectedDate" dateFormat="dd.mm.yy" showIcon class="flex-item"/>
    </div>
    <Dialog :modal="true" :closeOnEscape="true" :closable="true" v-model:visible="showDialog" header="Neues ToDo">
      <form @submit.prevent="addTodo" class="todo-form">
        <input v-model="newTodo.title" placeholder="Title" required />
        <input v-model="newTodo.description" placeholder="Description" />
        <select v-model="newTodo.priority">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input v-model="newTodo.due_date" type="date" required />
        <button type="submit">Add ToDo</button>
      </form>
    </Dialog>
    <DataTable :value="todos" paginator :rows="10" :filters="filters" :globalFilterFields="['title', 'description', 'priority', 'status']" filterDisplay="menu" showGridlines>
      <template #header>
        <div class="flex justify-between">
          <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
          <IconField iconPosition="left">
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
          </IconField>
        </div>
      </template>
      <template #empty> No entries found. </template>
      <template #loading> Loading data. Please wait. </template>
      <Column field="title" header="Title" sortable filter filterMatchMode="contains" filterPlaceholder="Filtern">
        <template #filter>
          <div class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <InputText v-model="globalFilters['title']" @input="onFilter('title', $event.target.value)" placeholder="Filtern" />
          </div>
        </template>
      </Column>
      <Column field="description" header="Description" sortable filter filterMatchMode="contains" filterPlaceholder="Filtern"></Column>
      <Column field="priority" header="Priority" sortable filter filterMatchMode="contains" filterPlaceholder="Filtern"></Column>
      <Column field="status" header="Status" sortable filter filterMatchMode="contains" filterPlaceholder="Filtern"></Column>
      <Column field="due_date" header="Due Date" sortable filter filterMatchMode="contains" filterPlaceholder="Filtern"></Column>
      <Column header="Actions" bodyStyle="text-align:center">
        <template #body="slotProps">
          <Button icon="pi pi-trash" class="p-button-danger" @click="deleteTodo(slotProps.data.id)" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref, onMounted, watch} from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Calendar from 'primevue/calendar';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import axios from 'axios';

export default defineComponent({
  name: 'ToDoComponent',
  components: {
    Button,
    DataTable,
    Column,
    Calendar,
    Dialog,
    InputIcon,
    InputText,
    IconField
  },
  setup() {
    const todos = ref<Todo[]>([]);
    const newTodo = ref<Todo>({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      due_date: new Date().toISOString().split('T')[0]
    });
    const selectedDate = ref<Date | null>(new Date());
    const filters = ref<{ global?: { value: string } }>({ global: { value: '' } });
    const showDialog = ref(false);

    const fetchTodos = async () => {
      if (!selectedDate.value) return;
      try {
        const year = selectedDate.value.getFullYear();
        const month = (selectedDate.value.getMonth() + 1).toString().padStart(2, '0');
        const day = selectedDate.value.getDate().toString().padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        const response = await axios.get('http://www.my-dashboard.net:3000/api/todos', {
          params: {
            due_date: formattedDate
          }
        });
        todos.value = response.data;
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };

    const addTodo = async () => {
      try {
        const response = await axios.post('http://www.my-dashboard.net:3000/api/todos', newTodo.value);
        todos.value.push(response.data);
        newTodo.value = {
          title: '',
          description: '',
          status: 'pending',
          priority: 'medium',
          due_date: new Date().toISOString().split('T')[0]
        };
        showDialog.value = false;
      } catch (error) {
        console.error('Error adding todo:', error);
      }
    };

    const deleteTodo = async (id: number) => {
      try {
        await axios.delete(`http://www.my-dashboard.net:3000/api/todos/${id}`);
        todos.value = todos.value.filter(todo => todo.id !== id);
      } catch (error) {
        console.error('Error deleting todo:', error);
      }
    };

    const toggleDialog = () => {
      showDialog.value = !showDialog.value;
    };

    watch(selectedDate, fetchTodos);

    onMounted(fetchTodos);

    const onDateChange = () => {
      fetchTodos();
    };

    return {
      todos,
      newTodo,
      addTodo,
      deleteTodo,
      selectedDate,
      fetchTodos,
      filters,
      showDialog,
      toggleDialog,
      onDateChange
    };
  }
});

</script>

<style scoped>
todo-container {
  margin: auto;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

form input,
form select,
form button {
  padding: 8px;
  font-size: 0.9em;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 8px;
  border: 1px solid #ddd;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
}

button:hover {
  background: #0056b3;
}

.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.flex-item {
  margin: 0 5px;
}

.todo-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.todo-form input,
.todo-form select,
.todo-form button {
  padding: 8px;
  font-size: 1em;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.todo-form button {
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.todo-form button:hover {
  background-color: #0056b3;
}
</style>
