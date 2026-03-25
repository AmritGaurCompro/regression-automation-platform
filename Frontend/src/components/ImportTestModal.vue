<script setup>
import { computed, ref } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Button from './ui/button/Button.vue';
import { Trash2 } from "lucide-vue-next"
import Separator from './ui/separator/Separator.vue';
import Input from './ui/input/Input.vue';
import axios from 'axios';
import { useTestStore } from '@/stores/testStore';

const testStore = useTestStore()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL


const open=ref(false);
const filename=ref('');
const pastedText=ref('');
const currFileInp=ref(null)
const hasSelectedFile = computed(() => filename.value.length > 0)
const hasPastedText = computed(() => pastedText.value.trim().length > 0)
const savedFileName=ref('')
const error=ref('')
const hasError = computed(() => error.value.length > 0)

const show = () => {
  open.value = true
  savedFileName.value=''
  filename.value=''
  pastedText.value=''
  currFileInp.value = null
  error.value=''
}

const close=()=>{
    open.value=false
    savedFileName.value=''
    filename.value=''
    pastedText.value=''
    currFileInp.value = null
    error.value=''
}

const handleFileChange = (e) => {
  const input = e.target
  const file = input.files?.[0]

  if (!file) return

  const allowedExt = ["spec.js"]

  const parts = file.name.split(".")
  const lastExt = parts.length > 1 ? parts.pop().toLowerCase() : ""
  const secondLastExt = parts.length > 1 ? parts.pop().toLowerCase() : ""
  const ext=`${secondLastExt}.${lastExt}`


  const isValid = allowedExt.includes(ext)

  if (!isValid) {
    input.value = ""      
    filename.value = ""
    alert("Invalid file type. Please select a .spec.js file.")
    return
  }

  filename.value = file.name
}


const removeSelection=()=>{
  if (currFileInp.value) {
    currFileInp.value.value = ''
  }
  filename.value = ''
  currFileInp.value = null
}

const validate = () => {
  const value = savedFileName.value

  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(value)) {
    error.value =
      'File name must start with a letter and contain only letters or numbers'
    return
  }

  error.value = ''
}

const save = async () => {
  if (!hasSelectedFile.value && !hasPastedText.value) {
    error.value = 'Please select a file or paste a script'
    return
  }

  let scriptContent = ''

  try {
    if (hasSelectedFile.value) {
      scriptContent = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsText(currFileInp.value.files[0])
      })
    } else {
      scriptContent = pastedText.value
    }

    await axios.post(`${API_BASE_URL}/api/import_tests`, {
      saved_filename: savedFileName.value,
      saved_script_content: scriptContent
    })

    await testStore.refreshTestsFromBackend()
    close()
  } catch (err) {
    if (err.response?.data?.error) {
      error.value = err.response.data.error
    } else {
      error.value = 'An error occurred. Please try again.'
    }
  }
}


defineExpose({ show })

</script>

<template>
<Dialog v-model:open="open">
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Import Test</DialogTitle>
    </DialogHeader>

    <div class="mt-10">

      <input
        ref="currFileInp"
        type="file"
        @change="handleFileChange"
        :disabled="hasPastedText"
        class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
    
      <div v-if="filename" class="mt-2 flex gap-2 flex-wrap" >
        <p class="text-sm text-green-500 mt-2 text-wrap">Selected file: {{ filename }}</p>
        <Button variant="destructive" size="icon" @click="removeSelection" v-if="filename" class="text-red-500">
           <Trash2 class="w-4 h-4" />
       </Button>
      </div>


      <p class="text-center mt-5 mb-5 font-semibold">OR</p>
    
      <textarea
        v-model="pastedText"
        placeholder="Paste your test script here..."
        rows="20"
        :disabled="hasSelectedFile"
        class="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y max-h-[400px]"
      />
    </div>


    <div class="mt-2">
        <Input placeholder="Enter file name to be saved (without extension)" v-model="savedFileName" @input="validate" />
        <p v-if="hasError" class="text-sm text-red-500 mt-1">{{ error }}</p>
    </div>

    
    <DialogFooter class="mt-4 gap-2">
        <Button variant="outline" @click="close">
          Cancel
        </Button>

        <Button :disabled="hasError || !savedFileName " @click="save" >
          Save
        </Button>
    </DialogFooter>

</DialogContent>
  

</Dialog>
</template>
