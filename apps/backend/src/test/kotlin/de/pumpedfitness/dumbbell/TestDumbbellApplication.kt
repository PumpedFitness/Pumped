package de.pumpedfitness.dumbbell

import org.springframework.boot.fromApplication
import org.springframework.boot.with


fun main(args: Array<String>) {
    fromApplication<DumbbellApplication>().with(TestcontainersConfiguration::class).run(*args)
}
