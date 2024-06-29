<template>
  <div class="todo-container">
    <h1>ToDo List</h1>
    <div class="flex-container">
      <Button @click="prevDay" icon="pi pi-chevron-left" class="flex-item"/>
      <Calendar v-model="selectedDate" dateFormat="dd.mm.yy" showIcon class="flex-item"/>
      <Button @click="nextDay" icon="pi pi-chevron-right" class="flex-item"/>
      <Button @click="toggleDialog" label="Add ToDo" icon="pi pi-plus" class="flex-item"/>
      <Calendar v-model="selectedDate" dateFormat="dd.mm.yy" showIcon class="flex-item"/>
    </div>
    <Dialog :modal="true" :closeOnEscape="true" :closable="true" v-model:visible="showDialog" header="Neues ToDo">
      <form @submit.prevent="addTodo" class="add-todo-dialog">
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
    <DataTable :value="todos" paginator :rows="10" :filters="filters" :globalFilterFields="['title', 'description', 'priority', 'status']" filterDisplay="menu" showGridlines :rowClass="getRowClass">
      <template #header>
        <div class="flex justify-between">
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
      <Column field="title" header="Title" sortable filter filterMatchMode="contains" filterPlaceholder="Filtern"></Column>
      <Column field="description" header="Description" sortable filter filterMatchMode="contains" filterPlaceholder="Filtern"></Column>
      <Column field="status" header="Status" sortable filter filterMatchMode="contains" filterPlaceholder="Filtern"></Column>
      <Column field="priority" header="Priority" sortable filter filterMatchMode="contains" filterPlaceholder="Filtern">
        <template #body="slotProps">
          <i :class="priorityIcon(slotProps.data.priority)" style="font-size: 1.5em;"></i>
        </template>
      </Column>
      <Column header="Actions" bodyStyle="text-align:center">
        <template #body="slotProps">
          <Button v-if="!isDone(slotProps.data)" icon="pi pi-check" @click="markAsDone(slotProps.data)" />
          <Button icon="pi pi-trash" class="p-button-danger" @click="deleteTodoWithAnimation(slotProps.data.id)" />
        </template>
      </Column>
    </DataTable>

    <!-- Erfolgsicon -->
    <i v-if="showSuccessIcon" class="pi pi-check success-icon"></i>
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
import { ToDo } from "../types/ToDo";
import {FilterMatchMode} from "primevue/api";

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
    const todos = ref<ToDo[]>([]);
    const newTodo = ref<ToDo>({
      done: false,
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      due_date: new Date().toISOString().split('T')[0]
    });
    const selectedDate = ref<Date>(new Date());
    const filters = ref({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
      'country.name': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
      representative: { value: null, matchMode: FilterMatchMode.IN },
      status: { value: null, matchMode: FilterMatchMode.EQUALS },
      verified: { value: null, matchMode: FilterMatchMode.EQUALS }
    });
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
          done: false,
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

    const showSuccessIcon = ref(false);

    const deleteTodoWithAnimation = async (id: number) => {
      try {
        await deleteTodo(id);
        showSuccessIcon.value = true;
        setTimeout(() => {
          showSuccessIcon.value = false;
        }, 2000);
      } catch (error) {
        console.error('Error deleting todo:', error);
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

    const priorityClass = (priority: string) => {
      return priority.toLowerCase();
    };

    const getRowClass = (rowData: ToDo) => {
      return {
        'low-row': rowData.priority === 'low',
        'medium-row': rowData.priority === 'medium',
        'high-row': rowData.priority === 'high',
        'done-row': rowData.done,
      };
    };

    const priorityIcon = (priority: string) => {
      switch (priority) {
        case 'low':
          return 'pi pi-arrow-down low-icon';
        case 'medium':
          return 'pi pi-arrow-right medium-icon';
        case 'high':
          return 'pi pi-arrow-up high-icon';
        default:
          return '';
      }
    };

    const markAsDone = async (todo: ToDo) => {
      try {
        const updatedTodo = {
          ...todo,
          done: true,
          // Formatiere das Datum korrekt, ohne Zeitzonenverschiebung
          due_date: formatDate(todo.due_date),
        };
        await axios.put(`http://www.my-dashboard.net:3000/api/todos/${todo.id}`, updatedTodo);
        todo.done = true; // Lokale Aktualisierung
      } catch (error) {
        console.error('Error marking todo as done:', error);
      }
    };

// Funktion zum Formatieren des Datums ohne Zeitzonenverschiebung
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const isDone = (rowData: ToDo): boolean => {
      return rowData.done ? true : false;
    };

    const prevDay = () => {
      if (selectedDate.value) {
        const newDate = new Date(selectedDate.value.toDateString());
        newDate.setDate(newDate.getDate() - 1);
        selectedDate.value = newDate;
        fetchTodos();
      }
    };

    const nextDay = () => {
      if (selectedDate.value) {
        const newDate = new Date(selectedDate.value.toDateString());
        newDate.setDate(newDate.getDate() + 1);
        selectedDate.value = newDate;
        fetchTodos();
      }
    };

    return {
      filters,
      newTodo,
      selectedDate,
      showDialog,
      showSuccessIcon,
      todos,
      addTodo,
      deleteTodo,
      fetchTodos,
      toggleDialog,
      onDateChange,
      priorityClass,
      deleteTodoWithAnimation,
      getRowClass,
      priorityIcon,
      markAsDone,
      isDone,
      prevDay,
      nextDay,
    };
  }
});

</script>

<style>
.flex-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.flex-item {
  margin: 0 5px;
}

.todo-container {
  margin: auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.low-row {
  background-color: #e6ffed; /* Helles Grün für niedrige Priorität */
}

.medium-row {
  background-color: #fff5e6; /* Helles Gelb für mittlere Priorität */
}

.high-row {
  background-color: #ffe6e6; /* Helles Rot für hohe Priorität */
}

.done-row {
  text-decoration: line-through;
  color: gray;
}

.add-todo-dialog {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.add-todo-dialog input,
.add-todo-dialog select,
.add-todo-dialog button {
  padding: 10px;
  font-size: 1em;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.add-todo-dialog button {
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.add-todo-dialog button:hover {
  background-color: #0056b3;
}

.p-datatable .p-datatable-tbody > tr > td {
  padding: 0.25rem 1rem;
}

</style>
