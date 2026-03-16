import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity
} from "react-native";

import { useDispatch, useSelector } from "react-redux";
import { addTodo, toggleTodo, removeTodo } from "../redux/todoSlice";

export default function TodoScreen() {

  const [text,setText] = useState("");

  const dispatch = useDispatch();

  const todos = useSelector((state:any)=>state.todo.todos);

  const addTask = () => {

    if(!text) return;

    dispatch(addTodo({
      id: Date.now().toString(),
      text: text,
      completed:false
    }));

    setText("");
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="เพิ่มงาน..."
        value={text}
        onChangeText={setText}
        style={styles.input}
      />

      <Button
        title="เพิ่มงาน"
        onPress={addTask}
      />

      <View style={styles.list}>

        {todos.map((todo:any)=>(
          <View key={todo.id} style={styles.row}>

            <TouchableOpacity
              onPress={()=>dispatch(toggleTodo(todo.id))}
            >
              <Text
                style={[
                  styles.todoText,
                  todo.completed && styles.completed
                ]}
              >
                {todo.text}
              </Text>
            </TouchableOpacity>

            <Button
              title="ลบ"
              onPress={()=>dispatch(removeTodo(todo.id))}
            />

          </View>
        ))}

      </View>

      <Text style={styles.total}>
        จำนวนงานทั้งหมด {todos.length}
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    padding:10
  },

  title:{
    fontSize:22,
    fontWeight:"bold",
    marginBottom:20
  },

  input:{
    borderWidth:1,
    borderColor:"#ccc",
    padding:10,
    borderRadius:5,
    marginBottom:10
  },

  list:{
    marginTop:8
  },

  row:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    marginBottom:10
  },

  todoText:{
    fontSize:16,
    color: "gray"
  },

  completed:{
    textDecorationLine:"line-through",
    color: "black"
  },

  total:{
    marginTop:8,
    fontSize:16
  }

});