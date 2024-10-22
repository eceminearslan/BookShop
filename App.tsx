import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, FlatList, Switch } from 'react-native';

const App = () => {
    const [books, setBooks] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [discountApplied, setDiscountApplied] = useState(false);

    const apiKey = 'R5TG8R8Tvu58hFu6pVjo1Z9l3QGZ1snr'; // Buraya kendi API anahtarını ekle

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch(`https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${apiKey}`);
                const data = await response.json();
                console.log(data); // API yanıtını kontrol et
                if (data.results && data.results.books) { // Kontrol ekle
                    const updatedBooks = data.results.books.map(book => ({
                        ...book,
                        price: Math.floor(Math.random() * 100) + 20, // Farklı fiyatlar için rastgele değer
                        quantity: 1, // Başlangıçta miktar 1
                    }));
                    setBooks(updatedBooks);
                } else {
                    console.error("Books verisi bulunamadı");
                }
            } catch (error) {
                console.error("API hatası:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    const addToCart = (book) => {
        setCart((prevCart) => {
            const existingBook = prevCart.find(item => item.primary_isbn10 === book.primary_isbn10);
            if (existingBook) {
                return prevCart.map(item => 
                    item.primary_isbn10 === book.primary_isbn10 
                    ? { ...item, quantity: item.quantity + 1 } 
                    : item
                );
            } else {
                return [...prevCart, { ...book, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (book) => {
        setCart((prevCart) => {
            const existingBook = prevCart.find(item => item.primary_isbn10 === book.primary_isbn10);
            if (existingBook.quantity > 1) {
                return prevCart.map(item => 
                    item.primary_isbn10 === book.primary_isbn10 
                    ? { ...item, quantity: item.quantity - 1 } 
                    : item
                );
            } else {
                return prevCart.filter(item => item.primary_isbn10 !== book.primary_isbn10);
            }
        });
    };

    const calculateTotal = () => {
        return cart.reduce((total, book) => {
            const price = discountApplied ? book.price * 0.8 : book.price; // %20 indirim
            return total + price * book.quantity;
        }, 0);
    };

    if (loading) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            {/* Başlık */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Kitap Kurdu Alışveriş</Text>
            </View>

            <FlatList
                data={books}
                keyExtractor={(item) => item.primary_isbn10}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image source={{ uri: item.book_image }} style={styles.image} />
                        <View style={styles.details}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.price}>{item.price} TL</Text>
                            <View style={styles.quantityControl}>
                                <TouchableOpacity onPress={() => removeFromCart(item)} style={styles.quantityButton}>
                                    <Text style={styles.quantityButtonText}>-</Text>
                                </TouchableOpacity>
                                <Text>{cart.find(cartItem => cartItem.primary_isbn10 === item.primary_isbn10)?.quantity || 0}</Text>
                                <TouchableOpacity onPress={() => addToCart(item)} style={styles.quantityButton}>
                                    <Text style={styles.quantityButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity onPress={() => addToCart(item)} style={styles.addButton}>
                                <Text style={styles.addButtonText}>Sepete Ekle</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
            <View style={styles.cartTotal}>
                <Text style={styles.totalText}>Sepet Toplamı: {calculateTotal()} TL</Text>
                <Switch 
                    value={discountApplied} 
                    onValueChange={() => setDiscountApplied(prev => !prev)} 
                />
                {discountApplied && <Text style={styles.discountText}>Uygulanan İndirim!</Text>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        padding: 20,
        backgroundColor: 'orange',
        alignItems: 'center',
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    card: {
        marginBottom: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        flexDirection: 'row',
    },
    image: {
        width: 100,
        height: 150,
        marginRight: 10,
    },
    details: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    price: {
        fontSize: 16,
        color: 'green',
        marginBottom: 10,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    quantityButton: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    quantityButtonText: {
        color: '#fff',
    },
    addButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
    },
    cartTotal: {
        marginTop: 20,
        padding: 10,
        backgroundColor: 'orange',
        borderRadius: 5,
        alignItems: 'center',
    },
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    discountText: {
        color: 'red',
        marginTop: 5,
    },
});

export default App;
