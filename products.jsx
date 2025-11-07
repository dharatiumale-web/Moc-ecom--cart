import React, { useEffect, useState } from 'react'

export default function Products({ onAdd }) {
  const [products, setProducts] = useState([])

  useEffect(()=> {
    fetch('/api/products').then(r=> r.json()).then(setProducts)
  }, [])

  const addToCart = async (productId) => {
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, qty: 1 })
    })
    onAdd && onAdd()
  }

  return (
    <div>
      <h2>Products</h2>
      <div className="grid">
        {products.map(p => (
          <div className="card" key={p.id}>
            <h3>{p.name}</h3>
            <p>₹ {p.price.toFixed(2)}</p>
            <button onClick={()=> addToCart(p.id)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  )
}
