import React, { useEffect, useState } from 'react'
import Products from './products'
import Cart from './cart'

export default function App() {
  const [view, setView] = useState('products')
  const [cartData, setCartData] = useState({ items: [], total: 0 })

  const refreshCart = async () => {
    const r = await fetch('/api/cart')
    const j = await r.json()
    setCartData(j)
  }

  useEffect(()=> { refreshCart() }, [])

  return (
    <div className="container">
      <header>
        <h1>Nexora – Mock E‑Commerce</h1>
        <nav>
          <button onClick={()=> setView('products')}>Products</button>
          <button onClick={()=> setView('cart')}>Cart ({cartData.items.length})</button>
        </nav>
      </header>

      <main>
        { view === 'products' && <Products onAdd={refreshCart} /> }
        { view === 'cart' && <Cart cart={cartData} onChange={refreshCart} /> }
      </main>

      <footer>
        <small>Built for Nexora assignment</small>
      </footer>
    </div>
  )
}
