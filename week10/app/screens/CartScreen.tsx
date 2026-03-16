import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet 
} from "react-native";

import { useDispatch, useSelector } from "react-redux";
import { addItem, removeItem, clearCart } from "../redux/cartSlice";

export default function CartScreen() {

  const [name,setName] = useState("");
  const [quantity,setQuantity] = useState("");
  const [price,setPrice] = useState("");

  const dispatch = useDispatch();

  const items = useSelector((state:any)=>state.cart.items);
  const total = useSelector((state:any)=>state.cart.totalAmount);

  const addProduct = () => {

    if(!name || !quantity || !price) return;

    dispatch(addItem({
      id: Date.now().toString(),
      name: name,
      quantity: Number(quantity),
      price: Number(price)
    }));

    setName("");
    setQuantity("");
    setPrice("");
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="ชื่อสินค้า"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="จำนวน"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="ราคา"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      />

      <Button
        title="เพิ่มลงตะกร้า"
        onPress={addProduct}
      />

      <View style={styles.list}>

        {items.map((item:any)=>(
          <View key={item.id} style={styles.itemRow}>

            <Text>
              {item.name} x{item.quantity} ราคาต่อจำนวน {item.price} บาท
            </Text>

            <Button
              title="ลบ"
              onPress={()=>dispatch(removeItem(item.id))}
            />

          </View>
        ))}

      </View>

      <Text style={styles.total}>
        ยอดรวม {total} บาท
      </Text>

      <Button
        title="ล้างตะกร้า"
        onPress={()=>dispatch(clearCart())}
      />

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
    marginTop:2
  },

  itemRow:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    marginBottom:10
  },

  total:{
    marginTop:8,
    fontSize:16,
  }

});