package de.pumpedfitness.dumbbell

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class DumbbellApplication

fun main(args: Array<String>) {
    runApplication<DumbbellApplication>(*args)
}
