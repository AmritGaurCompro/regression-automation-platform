<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Record New Test</DialogTitle>
      </DialogHeader>

      <div class="space-y-2">
        <label class="text-sm text-muted-foreground">
          Test file name
        </label>

        <Input
          v-model="fileName"
          placeholder="loginTest"
          @input="validate"
        />

        <p class="text-xs text-muted-foreground">
          Only letters & numbers allowed. <br />  
        </p>

         <p class="text-xs text-muted-foreground">
         <b>Note:</b> Please close the recording browser to stop recording. <br />  
        </p>

        <p v-if="error" class="text-sm text-red-500">
          {{ error }}
        </p>
      </div>

      <DialogFooter class="mt-4">
        <Button variant="outline" @click="close">
          Cancel
        </Button>

        <Button
          :disabled="!!error || !fileName"
          @click="save"
        >
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const open = ref(false)
const fileName = ref('')
const error = ref('')


const show = () => {
  fileName.value = ''
  error.value = ''
  open.value = true
}


const close = () => {
  open.value = false
}


const validate = () => {
  const value = fileName.value

  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(value)) {
    error.value =
      'File name must start with a letter and contain only letters or numbers'
    return
  }

  error.value = ''
}



const save = async () => {
  if (error.value || !fileName.value) return

  const finalFileName = `${fileName.value}`

  try {
    await axios.post('/api/record_tests', {
      title: finalFileName
    })

    close()
  } catch (err) {
    error.value =
      err.response?.data?.error || 'File already exists'
  }
}


defineExpose({ show })
</script>
